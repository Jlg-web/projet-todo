/*jshint laxbreak:true */
/**
 * @class
 */
 (function (window) {
	'use strict';

	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#x27;',
		'`': '&#x60;'
	};

	var escapeHtmlChar = function (chr) {
		return htmlEscapes[chr];
	};

	var reUnescapedHtml = /[&<>"'`]/g;
	var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	var escape = function (string) {
		return (string && reHasUnescapedHtml.test(string))
			? string.replace(reUnescapedHtml, escapeHtmlChar)
			: string;
	};

	/**
	 * Configure les valeurs par défaut pour toutes les méthodes de modèle telles qu'un modèle par défaut
	 *
	 * @constructor
	 * @name Template
	 */
	function Template() {
		this.defaultTemplate
		=	'<li data-id="{{id}}" class="{{completed}}">'
		+		'<div class="view">'
		+			'<input class="toggle" type="checkbox" {{checked}}>'
		+			'<label>{{title}}</label>'
		+			'<button class="destroy"></button>'
		+		'</div>'
		+	'</li>';
	}

	/**
	 * Crée une chaîne HTML <li> et la renvoie pour placement dans votre application.
	 * @method
	 * @name Template.show
	 * @param {object} data
	 * @returns {string} Chaîne HTML d'un élément <li>
	 */
	Template.prototype.show = function (data) {
		var view = '';
		
		data.forEach(element => { 
			var template = this.defaultTemplate;
			var completed = '';
			var checked = '';

			if (element.completed) {
				completed = 'completed';
				checked = 'checked';
			}

			template = template.replace('{{id}}', element.id);
			template = template.replace('{{title}}', escape(element.title));
			template = template.replace('{{completed}}', completed);
			template = template.replace('{{checked}}', checked);

			view = view + template;
		});

		return view;
	};

	/**
	 * Affiche un compteur du nombre de tâches restant à accomplir
	 * @method
	 * @name Template.itemCounter
	 * @param {number} activeTodos Le nombre de tâches actives.
	 * @returns {string} Chaîne contenant le nombre
	 */
	Template.prototype.itemCounter = function (activeTodos) {
		var plural = activeTodos === 1 ? '' : 's';

		return '<strong>' + activeTodos + '</strong> item' + plural + ' left';
	};

	/**
	 * Met à jour le texte dans le bouton "Effacer terminé"
	 * @method
	 * @name Template.clearCompletedButton
	 * @param  {number} completedTodos 	Le nombre de tâches terminées.
	 * @returns {string} Chaîne contenant le nombre
	 */
	Template.prototype.clearCompletedButton = function (completedTodos) {
		if (completedTodos > 0) {
			return 'Clear completed';
		} else {
			return '';
		}
	};

	// Export to window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);
