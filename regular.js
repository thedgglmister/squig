//when path mode is on, start doesnt matter.... neither does turn stuff.... kinda? how to show this in menu?

//hide everyting when i draw!

//get rid of theta?

//use .one for lines and stuff instead of on and off.

//add esc stuff like getting out of draw mode and getting out of custom_menu

//hitting space or enter after custom_but toggles menu? why? cus draw_div is visible??? also, space hits squig??? i think accesibility is that space and enter automatically hit the focused div???

//why infinite loops when paths points are close? to prevent, only push point if its a certain percetn of radius awaay??

//in opening for example, shoudl small window be faster than big window? if its px per second, large radisu will slow it down. instead use length to standardize it???

//key to press to skip opening

$(document).ready(function() {

	var squig_params = {};
	var points = [];

	function init_params() {
		squig_params = {
			squig_i: 0,
			pipes: parseInt($("#pipes").val()), ///change
			width: parseInt($("#width").val()),
			speed: parseInt($("#speed").val()),
			color: $("#color").val(),
			min_s: parseInt($("#min_s").val()),
			max_s: parseInt($("#max_s").val()),
			min_r: parseInt($("#min_r").val()),
			max_r: parseInt($("#max_r").val()),
			min_t: parseInt($("#min_t").val()),
			max_t: parseInt($("#max_t").val()),
			init_left: parseInt($("#init_left").val()),
			init_top: parseInt($("#init_top").val()),
			init_angle: parseInt($("#init_angle").val()),  ///maybe need to get rid of ˚ or %
			repeats: $("#repeats").prop("checked"),
			win_bounds: get_win_bounds(), //call default bounds.
			show_divs: false,
			show_wraps: false,
			path_bounds: []
		};
	}

	function get_win_bounds() { //on resize................
		var win_h = $(window).height() + 100;
		var win_w = $(window).width() + 100;
		var left  = new Bound({x1: -100, y1: -100, x2: -100, y2: win_h, ineq: ">"});
		var top   = new Bound({x1: -100, y1: -100, x2: win_w, y2: -100, ineq: "<"});
		var right = new Bound({x1: win_w, y1: -100, x2: win_w, y2: win_h, ineq: "<"});
		var bot   = new Bound({x1: -100, y1: win_h, x2: win_w, y2: win_h, ineq: ">"});
		if (squig_params)
			squig_params.win_bounds = [left, top, right, bot];
		return ([left, top, right, bot]);
	}

	function create_line(x,y) {
		var line;
		function move_line(e) {
			var width = Math.sqrt((x - e.pageX) * (x - e.pageX) + (y - e.pageY) * (y - e.pageY));
	        var angle = Math.atan2(e.pageY - y, e.pageX - x)*180/Math.PI;
	        var transform = 'rotate(' + angle + 'deg)';
	        line.css({"width": width, "transform": transform});    
		}
	   	line = $('<div/>', {class: "line", css: {"left": x, "top": y}});
	    $("body").append(line);
	    $("#draw_div").on("mousemove", move_line);
	}

	function get_bound_trio(p1, p2) {
	    var dx = (p2.x - p1.x);
	    var dy = (-p2.y + p1.y);
	    var angle = -Math.atan2(dy, dx);
	    var s = (1 * squig_params.max_r) * Math.sin(angle); ////.75 can change....
	    var c = (1 * squig_params.max_r) * Math.cos(angle);
	    var ub_p1 = {x: (p1.x + s), y: (p1.y - c)};
	    var ub_p2 = {x: (p2.x + s), y: (p2.y - c)};
	    var lb_p1 = {x: (p1.x - s), y: (p1.y + c)};
	    var lb_p2 = {x: (p2.x - s), y: (p2.y + c)};
	    var u_ineq = (angle >= Math.PI / 2 || angle < -Math.PI / 2 ? ">" : "<");
	    var l_ineq = (u_ineq == "<" ? ">" : "<");
	    var g_ineq = (angle <= 0 ? ">" : "<");
	    var upper_bound =  new Bound({x1: ub_p1.x, y1: ub_p1.y, x2: ub_p2.x, y2: ub_p2.y, ineq: u_ineq});
	    var lower_bound = new Bound({x1: lb_p1.x, y1: lb_p1.y, x2: lb_p2.x, y2: lb_p2.y, ineq: l_ineq});
	    var goal_bound =  new Bound({x1: ub_p2.x, y1: ub_p2.y, x2: lb_p2.x, y2: lb_p2.y, ineq: g_ineq});
	    return [upper_bound, lower_bound, goal_bound];
	}

	function clear_path() {
		points = [];
	    squig_params.path_bounds = [];
		$(".line, .point_dot").remove();
		squig_params.init_left = parseInt($("#init_left").val());
		squig_params.init_top = parseInt($("#init_top").val());
	}

	function enter_draw_mode() {
		clear_path();
		$("#main_wrapper").hide();
		$("#draw_div").show();
	}

	function exit_draw_mode(e) {
	    if ($("#draw_div").is(":visible") && (e.which == 13 || e.which == 32)) {
	    	$("#draw_div").off("mousemove");
	    	$(".line").last().remove();
	    	if (points.length > 1) {
	    		for (var i = 0; i < points.length - 1; i++)
	        		squig_params.path_bounds.push(get_bound_trio(points[i], points[i + 1]));
	    		squig_params.init_left = points[0].x;
	    		squig_params.init_top = points[0].y;
	    	}
	    	else
	    		clear_path();
	    	$("#main_wrapper").show();
	    	$("#draw_div").hide();
		}
	}

	function toggle_menu() {
		if ($("#custom_menu").is(":visible"))
			exit_menu();
		else
			enter_menu();
	}

	function enter_menu() {
		$("#custom_menu, .line, .point_dot").show();
	}

	function exit_menu() {
		$("#custom_menu, .line, .point_dot").hide();
	}

	function build_and_draw_squig(get_duration) {
		var duration = 0;
		var squig    = new Squig(squig_params);

		squig.build_seq();
		if (get_duration) {
			for (var i = 0; i < squig.seq.length; i++)
				duration += squig.seq[i].duration;
		}
		squig.build_DOM();
		squig.animate_squig();
		squig_params.squig_i++; 
		return (duration);
	}

	function clear_squigs() {
		$(".wrap").remove();
		squig_params.squig_i = 0;
	}

	function validate_and_update_params(e) {
		//validate/////////////////////
		if (e.target.id == "repeats") 
	    	squig_params.repeats = $(e.target).prop("checked");
		else if (e.target.id == "color")
			squig_params.color = e.target.value;
		else 
	    	squig_params[e.target.id] = parseInt(e.target.value);
	}

	function blur_input(e) {
		if (e.which == 13 || e.which == 32)
		    $(this).blur();
	}

	function draw_new_point(e) {
		var new_point = $("<div/>", {class: "point_dot", css: {"left": e.pageX, "top": e.pageY}});
		new_point.appendTo("body").animate({"height": "10px", "width": "10px", "top": "-=5px", "left": "-=5px"}, 100);
	    points.push({x: e.pageX, y: e.pageY});
	    $("#draw_div").off("mousemove");
	    create_line(e.pageX, e.pageY);
	}

	function enter_about() {
		$("#about_div").animate({"top": 0}, 500);
	}

	function exit_about() {
		$("#about_div").animate({"top": "100vh"}, 500)
	}

	function toggle_divs() {
		if (squig_params.show_divs)
			$(".straight, .turn").css("background-color", "transparent");
		else {
			$(".turn").css("background-color", "red");
			$(".straight").css("background-color", "yellow");
		}
		squig_params.show_divs = !squig_params.show_divs;
	}

	function toggle_wraps() {
		if (squig_params.show_wraps)
			$(".wrap").css("background-color", "transparent");
		else
			$(".wrap").css("background-color", "blue");
		squig_params.show_wraps = !squig_params.show_wraps;
	}

	function opening_sequence() { //put this in its own file?
		$("#custom_menu").hide();

		squig_params = {
			squig_i: 0,
			width: 5,
			speed: 1,
			color: "black",
			min_s: 5,
			max_s: 12,
			min_r: 10,
			max_r: 20,
			init_angle: 0,
			repeats: false,
			show_divs: false,
			show_wraps: false,
			path_bounds: []
		}

		var s_points = [{x: 204, y: 76}, 
						{x: 171, y: 44}, 
						{x: 107, y: 36}, 
						{x: 53, y: 85}, 
						{x: 65, y: 143}, 
						{x: 129, y: 181}, 
						{x: 198, y: 210},
						{x: 205, y: 270},
						{x: 142, y: 307},
						{x: 88, y: 306},
						{x: 44, y: 266}];

		var q_points = [{x: 400, y: 197},
						{x: 441, y: 250},
						{x: 481, y: 197},
						{x: 487, y: 95},
						{x: 440, y: 39},
						{x: 365, y: 20},
						{x: 292, y: 80},
						{x: 288, y: 160},
						{x: 309, y: 240},
						{x: 368, y: 288},
						{x: 440, y: 263},
						{x: 465, y: 300},
						{x: 524, y: 294}];

		var u_points = [{x: 587, y: 38},
						{x: 579, y: 127},
						{x: 575, y: 236},
						{x: 612, y: 305},
						{x: 783, y: 303},
						{x: 762, y: 289},
						{x: 781, y: 236},
						{x: 785, y: 162},
						{x: 777, y: 49}];

		var i_points = [{x: 875, y: 19},
						{x: 874, y: 309}];

		var g_points = [{x: 1163, y: 68},
						{x: 1074, y: 29},
						{x: 982, y: 71},
						{x: 961, y: 182},
						{x: 988, y: 295},
						{x: 1084, y: 335},
						{x: 1169, y: 292},
						{x: 1189, y: 193},
						{x: 1086, y: 194}];

		var all_points = [s_points, q_points, u_points, i_points, g_points];

		//scale

		var ratio = $(window).width() / 1500;

		squig_params.min_r	= parseInt(squig_params.min_r * ratio);
		squig_params.max_r	= parseInt(squig_params.max_r * ratio);
		squig_params.min_s	= parseInt(squig_params.min_s * ratio);
		squig_params.max_s	= parseInt(squig_params.max_s * ratio);
		squig_params.width	= parseInt(squig_params.width * ratio);

		for (var i = 0; i < all_points.length; i++) {
			for (var j = 0; j < all_points[i].length; j++) {
				all_points[i][j].x *= ratio;
				all_points[i][j].y *= ratio;
				all_points[i][j].x += $(window).width() * 0.09;
				all_points[i][j].y += ($(window).height() - 0.28 * $(window).width()) / 2;
			}
		}

		var duration;
		var max_duration = 0;


		for (var i = 0; i < 5; i++) {


			for (var j = 0; j < all_points[i].length - 1; j++)
	        	squig_params.path_bounds.push(get_bound_trio(all_points[i][j], all_points[i][j + 1]));
	    	squig_params.init_left = all_points[i][0].x;
	    	squig_params.init_top = all_points[i][0].y;

	    	duration = build_and_draw_squig(true);
	    	if (duration > max_duration)
	    		max_duration = duration;
	    	squig_params.path_bounds = [];


			for (var j = all_points[i].length - 2; j >= 0; j--)
	        	squig_params.path_bounds.push(get_bound_trio(all_points[i][j + 1], all_points[i][j]));
	    	squig_params.init_left = all_points[i][all_points[i].length - 1].x;
	    	squig_params.init_top = all_points[i][all_points[i].length - 1].y;


	    	duration = build_and_draw_squig(true);
	    	if (duration > max_duration)
	    		max_duration = duration;
	    	squig_params.path_bounds = [];


		}

		init_params();
	








		setTimeout(function() {
			$("#begin_but").one("click", function() {
				clear_squigs();
				$("#main_wrapper").show();
			});
			$("#about_but").trigger("click");
		}, max_duration + 3000);

		//clear squigs after
	}


	$("#custom_but").on("click", toggle_menu);

	$("#squig_but").on("click", build_and_draw_squig);

	$("#clear_but").on("click", clear_squigs);

	$(".input").on("change", validate_and_update_params);

	$("#new_path").on("click", enter_draw_mode);

	$("#clear_path").on("click", clear_path);

	$("input").on("keypress", blur_input);

	$(window).on("resize", get_win_bounds);

	$("#draw_div").on("click", draw_new_point);
	        
	$(window).on("keypress", exit_draw_mode);

	$("#about_but").on("click", enter_about);

	$("#begin_but").on("click", exit_about);

	$("#toggle_divs").on("click", toggle_divs);

	$("#toggle_wraps").on("click", toggle_wraps);
////
////temp
	$(window).on("keypress", function() {
		for (var i = 0; i < points.length; i++)
			console.log(points[i]);
	})


	$(window).on("click", function(e) {
		if ($("#custom_menu").is(":visible") && e.target.id == "main_wrapper")
			exit_menu();
	});

	opening_sequence();



});