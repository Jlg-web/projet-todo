/*global qs, qsa, $on, $parent, $delegate */
/**
 * @class
 */
 (function (window) {
	'use strict';

	/**
	* Vue qui supprime complètement le DOM du navigateur.
	* @constructor View
	* @name View	
	* @param {object} template Template
	*/
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	/**
	 * Supprime un élément de la vue
	 * @method
	 * @name View._removeItem
	 * @param {number} id L'ID de l'élément à supprimer
	 */
	View.prototype._removeItem = function (id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};
	/**
	 * Met à jour l'affichage du bouton "clear completed"
	 * @method
	 * @name View._clearCompletedButton
	 * @param {number} completedCount ...
	 * @param {boolean} visible ...
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};
	/**
	 * Définir le filtre
	 * @method
	 * @name View._setFilter
	 * @param {string} currentPage
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};
	/**
	 * Définir la vue d'un élément terminé
	 * @method
	 * @name View._elementComplete
	 * @param {number} id L'identifiant de l'item
	 * @param {object} completed L'état d'achèvement ou non
	 */
	View.prototype._elementComplete = function (id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		/**
		 * Dans le cas où il a été basculé à partir d'un événement et non en cliquant sur la case à cocher
		*/
		qs('input', listItem).checked = completed;
	};
	/**
	 * La vue d'édition d'un élément
	 * @method
	 * @name View._editItem
	 * @param {number} id L'identifiant de l'article
	 * @param {string} title Le titre de l'article
	 */
	View.prototype._editItem = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};
	/**
	 * La vue d'édition d'un élément terminé
	 * @method
	 * @name View._editItemDone
	 * @param {number} id L'identifiant de l'item
	 * @param {string} title Le titre de l'item
	 */
	View.prototype._editItemDone = function (id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};
	/**
	 * Rendu de la vue
	 * @method
	 * @name View.render
	 * @param {string} viewCmd Nom de la commande
	 * @param {object} parameter Paramètres de la commande
	 */
	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			removeItem: function () {
				self._removeItem(parameter);
			},
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			setFilter: function () {
				self._setFilter(parameter);
			},
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};
	/**
	 * Vue de l'élément d'ID
	 * @method
	 * @name View._itemId
	 * @param {string} element ...
	 */
	View.prototype._itemId = function (element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};
	/**
	 * Modification de l'élément du gestionnaire terminée
	 * @method
	 * @name View._bindItemEditDone
	 * @param {function} handler 
	 */
	View.prototype._bindItemEditDone = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				this.blur();
			}
		});
	};
	/**
	 * Élément du gestionnaire "Edit/Cancel"
	 * @method
	 * @name View._bindItemEditCancel
	 * @param {function} handler 
	 */
	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};
	/**
	 * Gestionnaire
	 * @method
	 * @name View.bind
	 * @param {string} event 
	 * @param {function} handler 
	 */
	View.prototype.bind = function (event, handler) {
		var self = this;
		switch (event) {
			case 'newTodo':
				$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
				});
				break;
			case 'removeCompleted':
				$on(self.$clearCompleted, 'click', function () {
				handler();
				});
				break;
			case 'toggleAll':
				$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
				});
				break;
			case 'itemEdit':
				$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
				});
				break;
			case 'itemRemove':
				$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
				});
				break;
			case 'itemToggle':
				$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
				});
				break;
			case 'itemEditDone':
				self._bindItemEditDone(handler);
				break;
			case 'itemEditCancel':
				self._bindItemEditCancel(handler);
				break;
			default:
				return;
		};
	};

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
