const form_feedback = [];
const valid_email_test = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");
const valid_zip_code_test = new RegExp("[0-9]{5}");

function setup_member_form_submit() {
	const member_form = document.querySelector('#member-form');
	if(!member_form) return;
	member_form.addEventListener('submit', member_form_submit);
}
setTimeout(setup_member_form_submit,500);

function member_form_submit(event) {
	event.preventDefault();
	clear_form_feedback();
	const member_form = event.target;
	member_form.classList.add('processing');
	const is_valid = validate_form_fields(member_form);
	if(!is_valid) show_form_feedback();
	setTimeout(() => { member_form.classList.remove('processing') }, 500);

	return is_valid; // TODO: Handle form submit if is_valid
}

function validate_form_fields(form) {
	const groups = form.querySelectorAll('.input-group');
	const valid_flags = new Array(groups.length);
	for(let i=0; groups[i]; i++) {

		let group = groups[i];
		let valid_flag = undefined;
		let inputs = group.querySelectorAll('input');

		if(inputs[0] !== undefined) {
			let switch_type = inputs[0].getAttribute('type');
			switch(switch_type){
				case 'text':
					valid_flag = validate_text(inputs);
					break;
				case 'number':
					valid_flag = validate_number(inputs);
					break;
				case 'email':
					valid_flag = validate_email(inputs);
					break;
				case 'radio':
					valid_flag = validate_radio(inputs);
					break;
				case 'checkbox':
					valid_flag = validate_checkbox(inputs);
					break;
				default:
					let warning = `Warning: Unhandled input type case '${switch_type}' in validate_form_fields`;
					console.warn(warning);
					valid_flag = warning;
			}
		} else {
			let warning = `Warning: Each input-group needs an input`
			console.warning(warning, group);
			valid_flag = warning
		}
		valid_flags[i] = valid_flag;
	};

 	let is_valid = ! valid_flags.includes(false);
	return is_valid;
}

function validate_text(inputs) {
	let text = inputs[0];
	let required = text.getAttribute('required');
	let valid = undefined;
	required = (required === null || required === false || required === 'false') ? false : true;
	if(required) {
		if(text.classList.contains('zip-code')) {
			valid = valid_zip_code_test.test(text.value);
			if(!valid) handle_invalid_input(text, 'Please enter a 5 digit ZIP code');
		}
		else {
			valid = (text.value && text.value.length > 0);
			let label = text.parentNode.getElementsByTagName('label')[0];
			if(!valid) {
				if(label) {
					handle_invalid_input(text, `Please enter your information for ${label.innerText}`);
				}
				else {
					handle_invalid_input(text, 'Please enter missing information');
				}
			}
		}
	}
	return valid;
}

function validate_number(inputs) {
	let number = inputs[0];
	let valid = undefined;
	let value = Number(number.value);

	let over_18 = number.classList.contains('over-18');
	let step = number.getAttribute('step');
	let min = number.getAttribute('min');
	let max = number.getAttribute('max');

	let step_test = undefined;
	let in_range = undefined;

	if(step) {
		step = parseInt(step);
		step_test = (value % step) === 0;
	}
	if(min || max) {
		let min_test = undefined;
		let max_test = undefined;
		if(min) {
			min = parseInt(min);
			min_test = value >= min;
		}
		if(max) {
			max = parseInt(max);
			max_test = value <= max;
		}
		in_range = (min_test !== false && max_test !== false);
	}

	valid = (step_test !== false && in_range !== false);

	if(!valid) handle_invalid_input(number, 'Please enter a valid number');

	if(over_18 && value < 18) {
		valid = false;
		handle_invalid_input(number, 'Sorry, you must be over 18');
	}
	return valid;
}

function validate_email(inputs) {
	let email = inputs[0];
	let valid = valid_email_test.test(email.value);
	if(!valid) handle_invalid_input(email, 'Please enter a valid email address');
	return valid;
}
function validate_radio(inputs) {
	let buttons = inputs;
	let valid = false;
	for (let i=0; buttons[i]; i++) {
		if(buttons[i].checked) {
			valid = true;
			return true;
		}
	}
	let button_1 = buttons[0];
	let label = button_1.parentNode.parentNode.getElementsByTagName('label')[0];
	handle_invalid_input(button_1.parentNode.parentNode, `Please choose and option for "${label.innerText}"`, true);
	return valid;
}
function validate_checkbox(inputs) {
	let checkbox = inputs[0];
	let required = checkbox.getAttribute('required');
	let valid = (required !== null && checkbox.checked);
	if(!valid) {
		let label = checkbox.parentNode.getElementsByTagName('label')[0];
		handle_invalid_input(checkbox, `Please check "${label.innerText}"`);
	}
	return valid;
}

function handle_invalid_input(input, message = 'Please enter a value', is_nested_deep = false) {
	input.setAttribute('aria-invalid', true);
	let href = input.id;
	let help_message = `<a href="#${href}">${message}</a>`;
	form_feedback.push(help_message);
	input.parentNode.classList.add('invalid');
	if(is_nested_deep) {
		input.parentNode.addEventListener('focusin', el => {
			let input = el.target;
			input.setAttribute('aria-invalid', false);
			setTimeout(() => {input.parentNode.parentNode.parentNode.classList.remove('invalid')}, 500)
		});
	} else {
		input.parentNode.addEventListener('focusin', el => {
			let input = el.target;
			input.setAttribute('aria-invalid', false);
			setTimeout(() => {input.parentNode.classList.remove('invalid')}, 500)
		});
	}
}

function show_form_feedback() {
	const form_feedback_area = document.querySelector('.form-feedback');
	form_feedback_area.innerHTML = '';
	const feedback = document.createElement('p');

	if(form_feedback.length == 1) feedback.innerHTML = `There was 1 error`;
	else feedback.innerHTML = `There were ${form_feedback.length} errors`;
	feedback.innerHTML+= ` found in the information you submitted.`;
	form_feedback_area.appendChild(feedback);

	const list = document.createElement('ul');
	for (let i=0; form_feedback[i]; i++) {
		let li = document.createElement('li');
		li.innerHTML = form_feedback[i];
		list.appendChild(li);
	}
	form_feedback_area.appendChild(list);
	form_feedback_area.classList.add('active');
	form_feedback_area.focus();
}

function clear_form_feedback() {
	form_feedback.length = 0; // Clear any old feedback
	const form_feedback_area = document.querySelector('.form-feedback');
	form_feedback_area.innerHTML = '';
	form_feedback_area.classList.remove('active');
}
