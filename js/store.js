/*jshint eqeqeq:false */
/**
 * @class
 */
 (function (window) {
	'use strict';

	/**
	 * Crée un nouvel objet de stockage côté client
	 *
	 * @constructor Store
	 * @name Store
	 * @param {string} name 
	 * @param {function} callbackLa fonction de rappel après avoir déposé les données
	 */
	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			var data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Recherche des éléments en fonction d'une requête donnée en tant qu'objet JS
	 * @method
	 * @name Store.find
	 * @param {object} query 
	 * @param {function} callback	
	 */
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		var todos = JSON.parse(localStorage[this._dbName]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (var q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	/**
	 * Récupérera toutes les données de la collection
	 * @method
	 * @name Store.findAll
	 * @param {function} callback
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	 * Sauvegardera les données fournies dans la base de données	
	 * @method
	 * @name Store.save
	 * @param {object} updateData
	 * @param {function} callback 
	 * @param {number} id 
	 */
	Store.prototype.save = function (updateData, callback, id) {
		var data = JSON.parse(localStorage[this._dbName]);
		var todos = data.todos;

		callback = callback || function () {};
		
		/** 
		 * Si un ID a été réellement donné, recherchez l'élément et mettez à jour chaque propriété
		*/
		if (id) {
			var todo = todos.find(todo => todo.id == id );
			if (todo) {
				for (var key in updateData) {
						todo[key] = updateData[key];
				}
			}
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		} else {
			/**
			 * Generation d'un ID
			 */ 
			var newId = ""; 
			var charset = "0123456789";
			/**
			 * Vérifier si un identifiant n'existe pas déjà		
			 * */				
			do {
				newId = "";
				for (var i = 0; i < 6; i++) {
				 newId += charset.charAt(Math.floor(Math.random() * charset.length));
				}							
			} while (todos.some(todo => todo.id === parseInt(newId)))		
    		/** 
			 * Assignation ID
			*/ 
			updateData.id = parseInt(newId);    

			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}
	};

	/**
	 * Supprimera un article de la boutique en fonction de son identifiant
	 * @method
	 * @name Store.remove
	 * @param {number} id L'ID de l'élément que vous souhaitez supprimer
	 * @param {function} callback callback
	 */
	Store.prototype.remove = function (id, callback) {
		var data = JSON.parse(localStorage[this._dbName]);		
		data.todos = data.todos.filter(todo => todo.id !== id);			
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	/**
	 * Supprime tout le stockage et recommence à zéro
	 * @method
	 * @name Store.drop
	 * @param {function} callback callback
	 */
	Store.prototype.drop = function (callback) {
		var data = {todos: []};
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);