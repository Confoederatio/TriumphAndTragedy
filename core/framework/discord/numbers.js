//Functional numbers framework
module.exports = {
  arabicise: function (arg0_number) {
		//Convert from parameters
		var num = arg0_number;

		//Declare instance variables and reference arrays
		var array = num.split(""),
			conversion = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1, m: 1000, d: 500, c: 100, l: 50, x: 10, v: 5, i: 1 },
			total = 0,
			current,
			current_value,
			next,
			next_value;

		//Loop through provided number string
		for (var i = 0; i < array.length; i++) {
			current = array[i];
			current_value = conversion[current];

			next = array[i+1];
			next_value = conversion[next];

			if (current_value < next_value) {
				total -= current_value;
			} else {
				total += current_value;
			}
		}

		//Return statement
		return total;
	},

  deordinalise: function (arg0_string) {
		//Convert from parameters, add reference arrays
		var deordinalised_string = arg0_string;
		var ordinals = ["st", "nd", "rd", "th"];

		//Split up into multiple chunks
		deordinalised_string = (deordinalised_string.includes(" ")) ? deordinalised_string.split(" ") : [deordinalised_string];

		//Remove stray ordinals
		for (var i = 0; i < deordinalised_string.length; i++) {
			for (var x = 0; x < ordinals.length; x++) {
				if (deordinalised_string[i].indexOf(ordinals[x]) == 0) {
					deordinalised_string[i] = deordinalised_string[i].replace(ordinals[x], "");
				}
			}
			if (deordinalised_string[i] == "") {
				deordinalised_string.splice(i, 1);
			}
		}

		//Iterate over to purge ordinals
		for (var i = 0; i < deordinalised_string.length; i++) {
			//Look for ordinal
			var ordinal_found = false;
			for (var x = 0; x < ordinals.length; x++) {
				if (deordinalised_string[i].indexOf(ordinals[x]) != -1) {
					ordinal_found = true;
				}
			}

			var total_ordinal_amount = (ordinal_found) ? 2 : 0;
			var ordinal_percentage = total_ordinal_amount/deordinalised_string[i].length;

			if (ordinal_percentage > 0.50) { //Ordinal makes up majority of string, so delete
				deordinalised_string.splice(i, 1);
			}
		}

		return deordinalised_string.join(" ").trim();
	},

  generateRandomID: function () {
    //Return statement
    return randomNumber(0, 100000000000).toString();
  },

  getSum: function (arg0_numbers) {
    //Convert from parameters
    var numbers = getList(arg0_numbers);

    //Iterate over numbers array and return sum
    var total_sum = 0;

    for (var i = 0; i < numbers.length; i++)
      total_sum += parseInt(numbers[i]);

    //Return statement
    return total_sum;
  },

  modifyRange: function (arg0_array, arg1_number) {
    //Convert from parameters
    var array = arg0_array;
    var number = arg1_number;

    //Initialise array; number
    if (!Array.isArray(array)) array = [array, array];
    if (!Array.isArray(number)) number = [number, number];

    //Add number to array
    array[0] += number[0];
    array[1] += number[1];

    //Return statement
    return array;
  },

  modifyValue: function (arg0_object, arg1_key, arg2_number, arg3_delete_negative) {
    //Convert from parameters
    var object = arg0_object;
    var key = arg1_key;
    var number = parseFloat(arg2_number);
    var delete_negative = arg3_delete_negative;

    //Set value
    object[key] = (object[key]) ? object[key] + number : number;

    if (delete_negative)
      if (object[key] <= 0)
        delete object[key];

    //Return statement
    return object[key];
  },

  /*
    printPercentage() - Formats a string to fit a certain percentage (e.g. 23%), instead of a default decimal number.
    options: {
      base_zero: true/false, - Whether to start at a base zero instead of one
      ceiling: true/false, - Whether to round down or not. False by default
      display_prefix: true/false, - Whether or not to display a starting prefix
      is_modifier: true/false, - Used for parsing negative modifiers
      precision: 4 - The number of decimal places to display. 2 by default
    }
  */
  printPercentage: function (arg0_number, arg1_options) {
    //Convert from parameters
		let number = arg0_number;
		let options = (arg1_options) ? arg1_options : {};

    //Adjust for base_one; set options
    if (options.base_one)
      number--;
    if (!options.precision) options.precision = 2;

    //Declare local instance variables
		let hit_separator = false;
		let prefix_string = "";
		let separator_characters = 0;

    //Set prefix_string
    if (options.display_prefix && number > 0)
      prefix_string = `+`;
		
		let percentage_string = `${prefix_string}${(!options.display_float) ? Math[(options.ceiling) ? "ceil" : "round"](number*100) : Math.round(number*100*100*100)/100/100}`;
		let processed_string = "";

    for (let i = 0; i < percentage_string.length; i++) {
      if (hit_separator)
        separator_characters++;

      if (separator_characters <= options.precision)
        processed_string += percentage_string[i];

      if (percentage_string[i] === ".")
        hit_separator = true;
    }
		
		if (String(processed_string) === "NaN") processed_string = "0"; //Guard clause for NaN

    //Return statement
    return `${processed_string}%`;
  },

  /*
    printRange() - Returns a given range of numbers as a string using [min, max] format.
    array: [
      number_1,
      number_2
    ],
    options: {
      display_prefix: true/false, - Optional. Whether to display a prefix or not. False by default
      print_percentage: true/false - Optional. Whether to print percentage instead of number. False by default.
    }
  */
  printRange: function (arg0_array, arg1_options) {
    //Convert from parameters
    var array = arg0_array;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var local_function = (!options.print_percentage) ? global["parseNumber"] : global["printPercentage"];

    if (!Array.isArray(array))
      array = getList(array);

    //Return statement
    if (array.length > 1)
      return (array[0] == array[1]) ?
        local_function(array[0], options) :
        `${local_function(Math.min(array[0], array[1]), options)} - ${local_function(Math.max(array[0], array[1]), options)}`;
    if (array.length == 1)
      return local_function(array[0], options);
  },

  randomNumber: function (min, max, do_not_round) {
    //Declare local instance variables
    var random_number = Math.random() * (max - min) + min;

    //Return statement
  	return (!do_not_round) ? Math.round(random_number) : random_number;
  },

  returnSafeNumber: function (arg0_operation, arg1_default) {
    //Convert from parameters
    var operation = arg0_operation;
    var default_number = (arg1_default) ? arg1_default : 0;

    //Return statement
    return (!isNaN(operation) && isFinite(operation) && operation != undefined && operation != null) ?
      operation :
      default_number;
  },

  romanise: function (arg0_number) {
		//Convert from parameters
		var num = arg0_number;

		//Declare reference array
		var lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1, m: 1000, cm: 900, d: 500, cd: 400, c: 100, xc: 90, l: 50, xl: 40, x: 10, ix: 9, v: 5, iv: 4, i: 1},
			roman = "",
			i;

		for (i in lookup)
			while (num >= lookup[i]) {
				roman += i;
				num -= lookup[i];
			}

		//Return statement
		return roman;
	},

  splitNumber: function (arg0_number, arg1_parts) {
    //Convert from parameters
    var number = arg0_number;
    var parts = arg1_parts;

    //Return statement
    return [...module.exports.splitNumberParts(number, parts)];
  },

  splitNumberParts: function* (arg0_number, arg1_parts) {
    //Convert from parameters
    var number = arg0_number;
    var parts = arg1_parts;

    //Declare local instance variables
    var sum_parts = 0;

    //Split number randomly
    for (var i = 0; i < parts - 1; i++) {
      var part_number = Math.random()*(number - sum_parts);
      yield part_number;
      sum_parts += part_number;
    }

    yield number - sum_parts;
  },

  unzero: function (arg0_number, arg1_default) {
    //Convert from parameters
    var number = returnSafeNumber(arg0_number);
    var default_number = arg1_default;

    //Return statement
    return (number != 0) ? number : default_number;
  }
};
