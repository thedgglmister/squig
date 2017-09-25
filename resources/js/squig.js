$(document).ready(function() {

	var squig_params = {squig_i:     0,
						repeats:     false,
						show_divs:   false,
						show_wraps:  false,
						path_bounds: []};
	var points = [];
	var	color_open = false;
	var demo_timer;
	var	init_timer;
	var show_info_timer;
	var hide_info_timer;
	var mouse_down_target;
	var handle_max_pos = [$("#start").css("width") * $(window).width() / $(window).height(),
						  $("#start").css("width") * $(window).height() / $(window).width()];
	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

	function update_params() {
		squig_params["pipes"]      = parseInt($("#pipes").slider("value"));
		squig_params["width"]      = parseInt($("#width").slider("value"));
		squig_params["speed"]      = parseInt(104.76157 / Math.pow(1.0476157, $("#speed").slider("value")));
		squig_params["min_s"]      = parseInt($("#straights").slider("values")[0]);
		squig_params["max_s"]      = parseInt($("#straights").slider("values")[1]);
		squig_params["min_r"]      = parseInt($("#radii").slider("values")[0]);
		squig_params["max_r"]      = parseInt($("#radii").slider("values")[1]);
		squig_params["min_t"]      = parseInt($("#turns").slider("values")[0]);
		squig_params["max_t"]      = parseInt($("#turns").slider("values")[1]);
		squig_params["init_left"]  = parseInt($("#start").slider("values")[0] * $(window).width() / 1000);
		squig_params["init_top"]   = parseInt($("#start").slider("values")[1] * $(window).height() / 1000);
		squig_params["init_angle"] = 360 - parseInt($("#start").slider("values")[2] * 359 / 1000);
		squig_params["color"]      = $("#color").attr("name");
		squig_params["win_bounds"] = get_win_bounds();
	}

	function update_display(e, ui) {
		if (ui.handleIndex == 2)
			$(this).prev().children(".value2").text(parseInt(ui.value * 359 / 1000));
		else if ($(this).attr("id") == "start")
			$(this).prev().children(".value" + ui.handleIndex).text(parseInt(ui.value / 10));
		else 
			$(this).prev().children(".value" + ui.handleIndex).text(ui.value);
	}

	function get_win_bounds() {
		var win_h = $(window).height();
		var win_w = $(window).width();
		var left  = new Bound({x1: 0, y1: 0, x2: 0, y2: win_h, ineq: ">"});
		var top   = new Bound({x1: 0, y1: 0, x2: win_w, y2: 0, ineq: "<"});
		var right = new Bound({x1: win_w, y1: 0, x2: win_w, y2: win_h, ineq: "<"});
		var bot   = new Bound({x1: 0, y1: win_h, x2: win_w, y2: win_h, ineq: ">"});
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
		$("#width").prev().css("padding-top", "0px");
		$(".non-path").show();
		update_params();
		$(".squig" + squig_params.squig_i).remove();
	   	start_demo();

	}

	function enter_draw_mode() {
		clear_path();
		$("#main_wrapper").hide(); 
		$("#draw_div").show();
		$(".squig" + squig_params.squig_i).remove();
		clearInterval(demo_timer);
	}

	function exit_mode(e) {
		if ($("#draw_div").is(":visible") && (e.which == 13 || e.which == 32 || e.which == 27)) {
	    	$("#draw_div").off("mousemove");
	    	$(".line").last().remove();
	    	if (points.length > 1) {
	    		for (var i = 0; i < points.length - 1; i++)
	        		squig_params.path_bounds.push(get_bound_trio(points[i], points[i + 1]));
	        	$(".non-path").hide();
	        	$("#width").prev().css("padding-top", "5px");
	        }
	    	else
	    		clear_path();
	    	$("#main_wrapper").show();
	    	$("#draw_div").hide();
	    	$(".squig" + squig_params.squig_i).remove();
	    	init_timer = setTimeout(start_demo, 800);
		}
		else if (e.which == 27)
			exit_menu();
	}

	function toggle_menu() {
		if ($("#custom_menu").is(":visible") && $(".error_msg").length == 0)
			exit_menu();
		else
			enter_menu();
	}

	function start_demo() {
		clearInterval(demo_timer);
		$(".squig" + squig_params.squig_i).remove();
		build_and_draw_squig();
		squig_params.squig_i--;
		demo_timer = setInterval(function() {
			$(".squig" + squig_params.squig_i).remove();
			build_and_draw_squig();
			squig_params.squig_i--;
		}, 3000);
	}

	function enter_menu() {
		$(".menu_triangle").animate({"border-bottom-width": "10px"}, 200);
		$("#custom_menu").slideDown(400, "swing");
		$(".line, .point_dot").show();
		$(".straight, .turn").css("opacity", 0.08);
		$("#bottom_wrap").animate({"bottom": "-100px"}, 100);
		$("#toggle_wrap").animate({"right": "-200px"}, 100);
		$(".wrap, .straight, .turn").css("background-color", "transparent");
		$(".ui-slider").slider("option", "change", function() {update_params(); start_demo();});
		$("#color").on("change", start_demo);
		squig_params.show_divs = false;
		squig_params.show_wraps = false;
		$(".squig" + squig_params.squig_i).remove();
		init_timer = setTimeout(start_demo, 800);
	}

	function exit_menu() {
		var colors = ["transparent", "rgba(211, 36, 36, 0.3)", "rgba(228, 206, 19, 0.3)", "rgba(19, 76, 228, 0.3)"];
		$("#custom_menu").slideUp(400, "swing");
		$(".menu_triangle").animate({"border-bottom-width": "0px"}, 400);
		$(".line, .point_dot").hide();
		setTimeout(function() {$("#bottom_wrap").animate({"bottom": "30px"}, 400)}, 100);
		setTimeout(function() {$("#toggle_wrap").animate({"right": "0px"}, 400)}, 100);
		setTimeout(function() {
			$(".straight, .turn").css("opacity", 1);
			if ($("#toggle_divs").text() == "Hide Divs")
				squig_params.show_divs = true;
			if ($("#toggle_wraps").text() == "Hide Wraps")
				squig_params.show_wraps = true;
			$(".straight").css("background-color", colors[2 * squig_params.show_divs]);
			$(".turn").css("background-color", colors[1 * squig_params.show_divs]);
			$(".wrap").css("background-color", colors[3 * squig_params.show_wraps]);
		}, 400);
		$(".ui-slider").slider("option", "change", update_params);
		$("#color").off("change", start_demo);
		$(".squig" + squig_params.squig_i).remove();
		clearInterval(demo_timer);
		clearTimeout(init_timer);
	}

	function build_and_draw_squig(get_duration) {
		if ($(".error_msg").length == 0) {
			if (points.length != 0) {
				squig_params.init_left = points[0].x + parseInt((Math.random() - 0.5) * squig_params.max_r);
	    		squig_params.init_top = points[0].y + parseInt((Math.random() - 0.5) * squig_params.max_r);
	    		squig_params.init_angle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x) * 180 / Math.PI;
			}
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
	}

	function clear_squigs() {
		$(".wrap").remove();
		squig_params.squig_i = 0;
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
		$("#about_div").show();
		$("#about_div").animate({"top": 0}, 500);
	}

	function exit_about() {
		clear_squigs();
		$("#main_wrapper").show();
		$("#custom_menu").hide(); 
		$("#bgcolor").css("background-color", $("body").css("background-color"));
		$("#about_div").animate({"top": "100vh"}, 500, function() {
			$("#about_div").hide();
		});
	}

	function toggle_divs() {
		squig_params.show_divs = !squig_params.show_divs;
		var colors = ["transparent", "rgba(211, 36, 36, 0.3)", "rgba(228, 206, 19, 0.3)"];
		var msgs   = ["Show Divs", "Hide Divs"];
		$(".straight").css("background-color", colors[2 * squig_params.show_divs]);
		$(".turn").css("background-color", colors[1 * squig_params.show_divs]);
		$("#toggle_divs").html(msgs[1 * squig_params.show_divs]);
	}

	function toggle_wraps() {
		squig_params.show_wraps = !squig_params.show_wraps;
		var colors = ["transparent", "rgba(19, 76, 228, 0.3)"];
		var msgs   = ["Show Wraps", "Hide Wraps"];
		$(".wrap").css("background-color", colors[1 * squig_params.show_wraps]);
		$("#toggle_wraps").html(msgs[1 * squig_params.show_wraps]);
	}

	function opening_sequence() {
		squig_params = {
			squig_i: 0,
			width: 5,
			speed: 3,
			color: $("#color").attr("name"),
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
						{x: 575, y: 206},
						{x: 612, y: 305},
						{x: 763, y: 283},
						{x: 762, y: 249},
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

		setTimeout(enter_about, max_duration + 3000);
	}

	function show_info(e) {
		if ($(e.target).siblings(".info").is(":visible"))
			clearTimeout(hide_info_timer);
		show_info_timer = setTimeout(function() {
			$(e.target).siblings(".info, .info_triangle").show();
		}, 800);
	}

	function cancel_info(e) {
		clearTimeout(show_info_timer);
		hide_info_timer = setTimeout(function() {
			$(e.target).siblings(".info, .info_triangle").hide();
		}, 300);
	}

	function keep_info() {
		clearTimeout(hide_info_timer);
	}

	function hide_info(e) {
		hide_info_timer = setTimeout(function() {
			$(e.target).hide();
			$(e.target).siblings(".info, .info_triangle").hide();
		}, 300);
	}

	function init_sliders() {
		$("#pipes").slider({min:1, max:250, value: 20});
		$("#width").slider({min:1, max:50, value: 6});                 
		$("#speed").slider({min:1, max:100, value: 65});
		$("#radii").slider({min:1, max:100, values: [25, 40], range: true});  
		$("#straights").slider({min:0, max:100, values: [5, 15], range: true});
		$("#turns").slider({min:1, max:180, values: [50, 170], range: true});         
		$("#start").slider({min:0, max: 1000, values: [333, 500, 0]});
		$($("#start .ui-slider-handle")[0]).text("x");
		$($("#start .ui-slider-handle")[1]).text("y");   
		$($("#start .ui-slider-handle")[2]).text("θ");  
		$(".ui-slider-horizontal").slider({
			slide: update_display,
			change: update_params
		}); 
	}

	function click_close_menu(e) {
		if (mousedown_target == e.target && e.target == e.currentTarget && !color_open)
			exit_menu();
		color_open = $("#color").hasClass("jscolor-active") || $("#bgcolor").hasClass("jscolor-active");
	}

	function set_listeners() {
		$("#begin_but").one("click", exit_about);
		$("#custom_but").on("click", toggle_menu);
		$("#squig_but").on("click", build_and_draw_squig);
		$("#clear_but").on("click", clear_squigs);
		$("#color").on("change", update_params);
		$("#bgcolor").on("change", function() {
			$("body").css("background-color", $("#bgcolor").attr("name"))
		});
		$("#new_path").on("click", enter_draw_mode);
		$("#clear_path").on("click", clear_path);
		$(window).on("resize", update_params);
		$("#draw_div").on("click", draw_new_point);
		$(window).on("keyup", exit_mode);
		$("#toggle_divs").on("click", toggle_divs);
		$("#toggle_wraps").on("click", toggle_wraps);
		$(".help").on("mouseover", show_info);
		$(".info, .info_triangle").on("mouseover", keep_info);
		$(".help").on("mouseout", cancel_info);
		$(".info, .info_triangle").on("mouseout", hide_info);
		$("#main_wrapper").on("mousedown", function(e) {mousedown_target = e.target});
		$("#main_wrapper").on("mouseup", click_close_menu);
	}


	function main() {
		if (mobile) {
			$("body").append("<p id='mobile_error'>Squig doesn't currently support mobile browsers</p>")
		}
		else {
			opening_sequence();
			//$("#main_wrapper").show(); // only if no opening sequence
			init_sliders();
			update_params(); 
			set_listeners(); 
		}
	}

	main();

});
