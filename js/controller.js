/**
 * Fichier : Controller.js
 * @class
 */
 (function (window) {
	'use strict';

	/**
	 * Controller permettant l'interaction entre {@link Model} et {@link View}
	 *
	 * @constructor Controller
	 * @name Controller
	 * @param {object} model Instance {@link Model}
	 * @param {object} view Instance {@link View}
	 */
	function Controller(model, view) {
		var self = this;
		self.model = model;
		self.view = view;

		self.view.bind('newTodo', function (title) {
			self.addItem(title);
		});

		self.view.bind('itemEdit', function (item) {
			self.editItem(item.id);
		});

		self.view.bind('itemEditDone', function (item) {
			self.editItemSave(item.id, item.title);
		});

		self.view.bind('itemEditCancel', function (item) {
			self.editItemCancel(item.id);
		});

		self.view.bind('itemRemove', function (item) {
			self.removeItem(item.id);
		});

		self.view.bind('itemToggle', function (item) {
			self.toggleComplete(item.id, item.completed);
		});

		self.view.bind('removeCompleted', function () {
			self.removeCompletedItems();
		});

		self.view.bind('toggleAll', function (status) {
			self.toggleAll(status.completed);
		});
	}

	/**
	 * Charge et initialise la vue
	 * @method
	 * @name Controller.setView
	 * @param {string} locationHash '' | 'active' | 'completed'
	 */
	Controller.prototype.setView = function (locationHash) {
		var route = locationHash.split('/')[1];
		var page = route || '';
		this._updateFilterState(page);
	};

	/**
	 * Affiche tous les éléments dans le todo-list.
	 * @method
	 * @name Controller.showAll
	 */
	Controller.prototype.showAll = function () {
		var self = this;
		self.model.read(function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Affiche toutes les tâches actives
	 * @method
	 * @name Controller.showActive
	 */
	Controller.prototype.showActive = function () {
		var self = this;
		self.model.read({ completed: false }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Affiche toutes les tâches terminées
	 * @method
	 * @name Controller.showCompleted
	 */
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Evénement à déclencher lorsque vous souhaitez ajouter un élément.
	 * Gestion de l'insertion DOM et la sauvegarde du nouvel élément.
	 * @method
	 * @name Controller.addItem
	 * @param {string} title title of the item
	 */
	Controller.prototype.addItem = function (title) {
		var self = this;

		if (title.trim() === '') {
			return;
		}

		self.model.create(title, function () {
			self.view.render('clearNewTodo');
			self._filter(true);
		});
	};

	/**
	 * Déclenche le mode d'édition d'élément.
	 * @method
	 * @name Controller.editItem
	 * @param {number} id The ID of the item
	 */
	Controller.prototype.editItem = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItem', {id: id, title: data[0].title});
		});
	};

	/**
	 * Termine le mode d'édition d'élément avec succès.
	 * @method
	 * @name Controller.editItemSave
	 * @param {number} id The ID of the item
	 * @param {string} title title of the item
	 */
	Controller.prototype.editItemSave = function (id, title) {
		var self = this;

		while (title[0] === " ") {
			title = title.slice(1);
		}

		while (title[title.length-1] === " ") {
			title = title.slice(0, -1);
		}

		if (title.length !== 0) {
			self.model.update(id, {title: title}, function () {
				self.view.render('editItemDone', {id: id, title: title});
			});
		} else {
			self.removeItem(id);
		}
	};

	/** 
	 * Annule le mode d'édition d'élément.
	 * @method
	 * @name Controller.editItemCancel
	 * @param {number} id L' ID du model à mettre à éditer.
	 */
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItemDone', {id: id, title: data[0].title});
		});
	};

	/**
	 * Supprime un élément de la liste.
	 * @method
	 * @name Controller.removeItem
	 * @param {number} id L'ID de l'élément à retirer du DOM et du stockage.
	 * storage
	 */
	Controller.prototype.removeItem = function (id) {
		var self = this;
		var items;
		self.model.read(function(data) {
			items = data;
		});

		self.model.remove(id, function () {
			self.view.render('removeItem', id);
		});

		self._filter();
	};

	/**
	 * Supprime tous les éléments terminés du DOM et du stockage.
	 * @method
	 * @name Controller.removeCompletedItems
	 */
	Controller.prototype.removeCompletedItems = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			data.forEach(function (item) {
				self.removeItem(item.id);
			});
		});

		self._filter();
	};

	/**
	 * Met à jour l' affichage des éléments en fonction de leur statut.
	 * in storage based on the checkbox's state.
	 * @method
	 * @name Controller.toggleComplete
	 * @param {number} id L'ID de l'élément à compléter ou incomplet.
	 * @param {object} completed La case à cocher pour vérifier l'état d'achèvement ou pas
	 * @param {boolean|undefined} silent Empêcher le re-filtrage des éléments à faire
	 */
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		var self = this;
		self.model.update(id, { completed: completed }, function () {
			self.view.render('elementComplete', {
				id: id,
				completed: completed
			});
		});

		if (!silent) {
			self._filter();
		}
	};

	/**
	 * Permet de basculer l' activation / désactivation des cases à cocher.
	 * @method
	 * @name Controller.toggleAll
	 * @param {object} completed La case à cocher pour vérifier l'état d'achèvement ou pas
	 */
	Controller.prototype.toggleAll = function (completed) {
		var self = this;
		self.model.read({ completed: !completed }, function (data) {
			data.forEach(function (item) {
				self.toggleComplete(item.id, completed, true);
			});
		});

		self._filter();
	};

	/**
	 * Met à jour les parties de la page qui changent en fonction du nombre restant de todos.	
	 * @method
	 * @name Controller._updateCount
	 */
	Controller.prototype._updateCount = function () {
		var self = this;
		self.model.getCount(function (todos) {
			self.view.render('updateElementCount', todos.active);
			self.view.render('clearCompletedButton', {
				completed: todos.completed,
				visible: todos.completed > 0
			});

			self.view.render('toggleAll', {checked: todos.completed === todos.total});
			self.view.render('contentBlockVisibility', {visible: todos.total > 0});
		});
	};

	/**
	 * Filtre les éléments de la todo en fonction de la route active.
	 * @method
	 * @name Controller._filter
	 * @param {boolean|undefined} force
	 */
	Controller.prototype._filter = function (force) {
		var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

		/**
		* Mettre à jour les éléments sur la page qui changent à chaque fois
		*/
		this._updateCount();

		/**
		 * Si la dernière route active n'est pas "All", ou si nous changeons de route, nous recréons
		 * les éléments de l'élément todo, en appelant:
		 * this.show[All|Active|Completed]();
		 */
		if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
			this['show' + activeRoute]();
		}

		this._lastActiveRoute = activeRoute;
	};

	/**
	 * Met à jour les routes dans url.
	 * @method
	 * @name Controller._updateFilterState
	 * @param {string} currentPage La route actuelle active
	 */
	Controller.prototype._updateFilterState = function (currentPage) {
		/**
		 * Stockez une référence à la route active, ce qui nous permet de filtrer à nouveau
		 * les éléments de tâche tels qu'ils sont marqués comme complets ou incomplets.
		 */
		this._activeRoute = currentPage;

		if (currentPage === '') {
			this._activeRoute = 'All';
		}

		this._filter();

		this.view.render('setFilter', currentPage);
	};

	// Exporter vers window
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);