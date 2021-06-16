/**
 * @class
 */
 (function (window) {
	'use strict';

	/**
	 * Crée une nouvelle instance de modèle 
	 *
	 * @constructor Model
	 * @name Model
	 * @param {object} storage Une référence à la classe de stockage côté client
	 */
	function Model(storage) {
		this.storage = storage;
	}

	/**
	 * Crée un nouveau model de todo.
	 * @method
	 * @name Model.create
	 * @param {string} [title] Le titre de la tâche
	 * @param {function} [callback] callback après la création du model
	 */
	Model.prototype.create = function (title, callback) {
		title = title || '';
		callback = callback || function () {};

		var newItem = {
			title: title.trim(),
			completed: false
		};

		this.storage.save(newItem, callback);
	};

	/**
	 * Trouve et retourne un modèle en stockage	
	 * @method
	 * @name Model.read
	 * @param {string|number|object} [query] Une requête pour faire correspondre les modèles
	 * @param {function} [callback] callback
	 */
	Model.prototype.read = function (query, callback) {
		var queryType = typeof query;
		callback = callback || function () {};

		if (queryType === 'function') {
			callback = query;
			return this.storage.findAll(callback);
		} else if (queryType === 'string' || queryType === 'number') {
			query = parseInt(query, 10);
			this.storage.find({ id: query }, callback);
		} else {
			this.storage.find(query, callback);
		}
	};

	/**
	 * Met à jour un modèle en lui donnant un ID, des données à mettre à jour et un rappel à déclencher lorsque
	 * la mise à jour est terminée.
	 * @method
	 * @name Model.update
	 * @param {number} id L'identifiant du modèle à mettre à jour
	 * @param {object} data Les propriétés à mettre à jour et leur nouvelle valeur
	 * @param {function} callback Le rappel à déclencher lorsque la mise à jour est terminée.
	 */
	Model.prototype.update = function (id, data, callback) {
		this.storage.save(data, callback, id);
	};

	/**
	 * Supprime un modèle du stockage
	 * @method
	 * @name Model.remove
	 * @param {number} id L'ID du modèle à supprimer
	 * @param {function} callback Le rappel à déclencher lorsque la suppression est terminée.
	 */
	Model.prototype.remove = function (id, callback) {
		this.storage.remove(id, callback);
	};

	/**
	 * WARNING: supprime TOUTES les données du stockage.
	 * @method
	 * @name Model.removeAll
	 * @param {function} callback The callback to fire when the storage is wiped.
	 */
	Model.prototype.removeAll = function (callback) {
		this.storage.drop(callback);
	};

	/**
	 * Renvoie un décompte de toutes les tâches
	 * @method
	 * @name Model.getCount
	 */
	Model.prototype.getCount = function (callback) {
		var todos = {
			active: 0,
			completed: 0,
			total: 0
		};

		this.storage.findAll(function (data) {
			data.forEach(function (todo) {
				if (todo.completed) {
					todos.completed++;
				} else {
					todos.active++;
				}

				todos.total++;
			});
			callback(todos);
		});
	};

	// Export to window
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
