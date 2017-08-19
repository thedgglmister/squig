//when path mode is on, start doesnt matter.... neither does turn stuff.... kinda? how to show this in menu?

//hide everyting when i draw!

//get rid of theta?

$(document).ready(function() {

	var squig_parameters = {
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
		path_bounds: []
	};

	var points = [];

	function get_win_bounds() {
		var win_h = $(window).height() + 100;
		var win_w = $(window).width() + 100;
		var left  = new Bound({x1: -100, y1: -100, x2: -100, y2: win_h, ineq: ">"});
		var top   = new Bound({x1: -100, y1: -100, x2: win_w, y2: -100, ineq: "<"});
		var right = new Bound({x1: win_w, y1: -100, x2: win_w, y2: win_h, ineq: "<"});
		var bot   = new Bound({x1: -100, y1: win_h, x2: win_w, y2: win_h, ineq: ">"});
		if (squig_parameters)
			squig_parameters.win_bounds = [left, top, right, bot];
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
	   	line = $('<div/>', {class: "line show", css: {"left": x, "top": y}});
	    $("body").append(line);
	    $(".draw_div").on("mousemove", move_line);
	}

	function get_bound_trio(p1, p2) {
	    var dx = (p2.x - p1.x);
	    var dy = (-p2.y + p1.y);
	    var angle = -Math.atan2(dy, dx);
	    var s = (.75 * squig_parameters.max_r) * Math.sin(angle); ////.75 can change....
	    var c = (.75 * squig_parameters.max_r) * Math.cos(angle);
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
	    squig_parameters.path_bounds = [];
		$(".line, .point_dot").remove();
		squig_parameters.init_left = parseInt($("#init_left").val());
		squig_parameters.init_top = parseInt($("#init_top").val());
	}

	function enter_draw_mode() {
		clear_path();
		$(".custom_menu").removeClass("show");
		$(".draw_div").addClass("show");
	}

	function exit_draw_mode(e) {
	    if ($(".draw_div").hasClass("show") && (e.which == 13 || e.which == 32)) {
	    	$(".draw_div").off("mousemove");
	    	$(".line").last().remove();
	    	if (points.length > 1) {
	    		for (var i = 0; i < points.length - 1; i++)
	        		squig_parameters.path_bounds.push(get_bound_trio(points[i], points[i + 1]));
	    		squig_parameters.init_left = points[0].x;
	    		squig_parameters.init_top = points[0].y;
	    	}
	    	else
	    		clear_path();
	    	$(".custom_menu").addClass("show");
			$(".draw_div").removeClass("show");
		}
	}

	function toggle_menu() {
		if ($(".custom_menu").hasClass("show"))
			exit_menu();
		else
			enter_menu();
	}

	function enter_menu() {
		$(".custom_menu, .line, .point_dot").addClass("show");
	}

	function exit_menu() {
		$(".custom_menu, .line, .point_dot").removeClass("show");
	}

	function build_and_draw_squig() {
		var squig = new Squig(squig_parameters);
		squig.build_seq();
		squig.build_DOM();
		squig.animate_squig();
		squig_parameters.squig_i++; 
	}

	function clear_squigs() {
		$(".wrap").remove();
		squig_parameters.squig_i = 0;
	}

	function validate_and_update_params(e) {
		//validate/////////////////////
		if (e.target.id == "repeats") 
	    	squig_parameters.repeats = $(e.target).prop("checked");
		else if (e.target.id == "color")
			squig_parameters.color = e.target.value;
		else 
	    	squig_parameters[e.target.id] = parseInt(e.target.value);
	}

	function blur_input(e) {
		if (e.which == 13 || e.which == 32)
		    $(this).blur();
	}

	function draw_new_point(e) {
		var new_point = $("<div/>", {class: "point_dot show", css: {"left": e.pageX, "top": e.pageY}});
		new_point.appendTo("body").animate({"height": "10px", "width": "10px", "top": "-=5px", "left": "-=5px"}, 100);
	    points.push({x: e.pageX, y: e.pageY});
	    $(".draw_div").off("mousemove");
	    create_line(e.pageX, e.pageY);
	}

	function enter_about() {
		$(".about_div").addClass("show").animate({"top": 0}, 500);
	}

	function exit_about() {
		$(".about_div").animate({"top": "100vh"}, 500, function() {
			$(this).removeClass("show");
		});
	}


	$("#custom_but").on("click", toggle_menu);

	$("#squig_but").on("click", build_and_draw_squig);

	$("#clear_but").on("click", clear_squigs);

	$(".input").on("change", validate_and_update_params);

	$("#new_path").on("click", enter_draw_mode);

	$("#clear_path").on("click", clear_path);

	$("input").on("keypress", blur_input);

	$(window).on("resize", get_win_bounds);

	$(".draw_div").on("click", draw_new_point);
	        
	$(window).on("keypress", exit_draw_mode);

	$("#about_but").on("click", enter_about);

	$("#begin_but").on("click", exit_about);

	$("#about_but").trigger("click");

});