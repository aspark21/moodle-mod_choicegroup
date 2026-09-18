// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Real-time client-side validation for enrollment limits (min/max groups).
 * Shows a live count badge next to the submit button and, when the selection
 * violates a constraint, disables the button and shows an explanatory message.
 *
 * Required strings (preloaded by view.php via strings_for_js):
 *   enrollmentlimit_exact, enrollmentlimit_min,
 *   enrollmentlimit_toomany, enrollmentlimit_toomany_exact
 *
 * @module     mod_choicegroup/enrollment_limit_validator
 * @copyright  2026 Université de Lausanne
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define([], function() {
    return {
        /**
         * Initialise the validator.
         * @param {Object} params
         * @param {number} params.minenrollments  Minimum required selections (0 = no minimum).
         * @param {number} params.maxenrollments  Maximum allowed selections (0 = no maximum).
         */
        init: function(params) {
            var min = parseInt(params.minenrollments, 10) || 0;
            var max = parseInt(params.maxenrollments, 10) || 0;

            if (min === 0 && max === 0) {
                return;
            }

            var form = document.querySelector('form.tableform');
            if (!form) {
                return;
            }

            var submitBtn = form.querySelector('button[type="submit"]');
            if (!submitBtn) {
                return;
            }

            // True when teacher set min === max (exact requirement).
            var isExact = min > 0 && max > 0 && min === max;

            // Badge: shows how many groups are currently selected.
            var badge = document.createElement('span');
            badge.id = 'choicegroup-selection-count';
            badge.className = 'badge rounded-pill ms-2';
            badge.style.fontSize = '1rem';
            badge.style.verticalAlign = 'middle';

            // Message: explains why the selection is invalid (hidden when valid).
            var msg = document.createElement('div');
            msg.id = 'choicegroup-limit-msg';
            msg.className = 'small text-danger mt-1';
            msg.style.display = 'none';

            submitBtn.after(badge);
            badge.after(msg);

            /**
             * Recount checked boxes, update badge and message, enable/disable submit.
             */
            function update() {
                var count = form.querySelectorAll(
                    'input[type="checkbox"][name^="answer_"]:checked'
                ).length;
                var tooFew = min > 0 && count < min;
                var tooMany = max > 0 && count > max;
                var invalid = tooFew || tooMany;

                submitBtn.disabled = invalid;

                // Update badge.
                if (count === 0) {
                    badge.textContent = '';
                    badge.classList.remove('bg-success', 'bg-danger', 'text-white');
                } else {
                    badge.textContent = count;
                    badge.classList.remove('bg-success', 'bg-danger');
                    badge.classList.add(invalid ? 'bg-danger' : 'bg-success', 'text-white');
                }

                // Update explanatory message.
                var msgText = '';
                if (isExact && tooFew) {
                    msgText = M.util.get_string('enrollmentlimit_exact', 'choicegroup').replace('{$a}', min);
                } else if (isExact && tooMany) {
                    msgText = M.util.get_string('enrollmentlimit_toomany_exact', 'choicegroup').replace('{$a}', min);
                } else if (tooFew) {
                    msgText = M.util.get_string('enrollmentlimit_min', 'choicegroup').replace('{$a}', min);
                } else if (tooMany) {
                    msgText = M.util.get_string('enrollmentlimit_toomany', 'choicegroup').replace('{$a}', max);
                }

                if (msgText) {
                    msg.textContent = msgText;
                    msg.style.display = '';
                } else {
                    msg.style.display = 'none';
                }
            }

            form.addEventListener('change', function(e) {
                if (e.target.matches('input[type="checkbox"][name^="answer_"]')) {
                    update();
                }
            });
            update();
        }
    };
});
