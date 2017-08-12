$(document).on("ready", function() {


var worm_counter = 0;

var worm_parameters = {
    pipe_number: 20,
    thickness: 6,
    color: "black",
    speed: 3,
    min_s: 10, 
    max_s: 25,
    min_t: 50, 
    max_t: 170,
    min_r: 10, 
    max_r: 40,
    init_left: 500, 
    init_top: 250, 
    init_rotation: 0,
    all_pipes: false,
    path_mode: false,
    bounds: [],   
}

function clear_then_worm() {
    $(".wrap").remove();
    build_seq_DOM_and_animate(worm_parameters);
}

function toggle_menu() {
    if (!$(".menu").hasClass("open_menu")) {
        $(".menu").addClass("open_menu");
        clear_then_worm();
        timer = setInterval(clear_then_worm, 5000);   
    }
    else {
        $(".menu").removeClass("open_menu");
        clearInterval(timer);
        $(".wrap").remove();
        $(".line").remove();
        $(".point_dot").remove();
    }
}


function validate_and_update(e) {
    //add validation
    if (e.target.id == "all_pipes") {
        worm_parameters.all_pipes = $(e.target).prop("checked");
    }
    else {
        worm_parameters[e.target.id] = e.target.id == "color" ? e.target.value : parseInt(e.target.value);
    }
    clearInterval(timer)
    clear_then_worm();
    timer = setInterval(clear_then_worm, 5000);
}


function create_polygon_bounds(e) { //MAKE THIS SIMPLER AND BETTER CODE. HOW ABOUT JUST GETTING POINTS AT FIRST< VALIDATING BY CHECKING ANGLES OF POINTS, THEN AT THE END CALL A FUNCTION THAT TURNS AN ARRAY OF POINTS INTO AN ARRAY OF BOUNDS?
    e.stopPropagation();
    var bounds = [];
    var points = []
    var pc = 1;   
    
    function check_if_valid_polygon_point(x,y) {
        //check for problem
        for (var i = 0; i<bounds.length; i++) {
            if (!bounds[i].check_point(x,y)) {
                alert("Selected point creates a concave polygon. Select a new point.");
                return;
              }
        }
        //if not problem:
        //stop line from moving any more and create new line from new point
        $(window).off("mousemove");
        create_line(x,y);
        //add the new point
        points[pc] = {x: x, y: y};
        //get bounds[pc-1]
        var bound = new Bound({x1: points[pc].x, y1: points[pc].y, x2: points[pc-1].x, y2: points[pc-1].y, ineq: "<"});
        if(!bound.check_point(points[pc-2].x, points[pc-2].y)) {
            bound = new Bound({x1: points[pc].x, y1: points[pc].y, x2: points[pc-1].x, y2: points[pc-1].y, ineq: ">"});
        }
        bounds[pc-1] = bound;        
        //then update bounds[0]. different because it changes ineq if point is in
        var bound0 = new Bound({x1: points[pc].x, y1: points[pc].y, x2: points[1].x, y2: points[1].y, ineq: "<"});
        if(bound0.check_point(points[pc-1].x, points[pc-1].y)) {
            bound0 = new Bound({x1: points[pc].x, y1: points[pc].y, x2: points[1].x, y2: points[1].y, ineq: ">"});
        }
        bounds[0] = bound0;
        //increase point counter
        pc++;
    }
    
    
    function create_line(x,y) {
        var line = $('<div></div>', {
            class: "line",
            css: {"left": x, "top": y}
        });
        $("body").append(line);
        $(window).on("mousemove", function(e) {
            var width = Math.sqrt((x-e.pageX)*(x-e.pageX) + (y-e.pageY)*(y-e.pageY));
            var angle = Math.atan2(e.pageY - y, e.pageX - x)*180/Math.PI;
            var transform = 'rotate('+angle+'deg)';
            line.css({"width":width, "transform": transform});    
        });
    }
    

    ////////////////////////////////

   
   $(document).on("mouseleave", ".start_point", function() {
       $(this).css({"opacity": 0.7});
       $(this).animate({"height":"-=4px","width":"-=4px","top":"+=2px","left":"+=2px"},200);
       $(this).off("mouseenter");
       $(this).on("mouseenter", function() {
           $(this).css({"opacity": 1});
           $(this).animate({"height":"+=4px","width":"+=4px","top":"-=2px","left":"-=2px"},200);
       });
   });
   
   $(document).on("click", ".start_point", function(e) {
       e.stopPropagation();
       if (pc > 3) {
           $(window).off("mousemove");
           var width = Math.sqrt((points[pc-1].x-points[1].x)*(points[pc-1].x-points[1].x) + (points[pc-1].y-points[1].y)*(points[pc-1].y-points[1].y));
           var angle = Math.atan2(points[1].y - points[pc-1].y, points[1].x - points[pc-1].x)*180/Math.PI;
           var transform = 'rotate('+angle+'deg)';
           $(".line").last().css({"width":width, "transform": transform}); 
           var bound = new Bound({x1: points[1].x, y1: points[1].y, x2: points[pc-1].x, y2: points[pc-1].y, ineq: "<"})
           if(!bound.check_point(points[pc-2].x, points[pc-2].y)) {
               bound = new Bound({x1: points[1].x, y1: points[1].y, x2: points[pc-1].x, y2: points[pc-1].y, ineq: ">"});
           }
           bounds[pc-1] = bound;
           worm_parameters.bounds = bounds.slice(1);
           $(".start_point").remove();
           $(".line").remove();
           $(window).off("click");
           $(document).off("click");
           $(document).off("mouseleave");
           toggle_menu();
       }
   });
    

    $(window).on("click", function(e) {
    
        if (pc == 1) {
            $("body").append($("<div/>", {class: "start_point",
                                          css: {"left": e.pageX, "top":e.pageY},
            }));
            $(".start_point").animate({"height":"20px","width":"20px","top":"-=10px","left":"-=10px"},100)
        }
        
        if (pc <= 2) {
            points[pc] = {x: e.pageX, y: e.pageY};
            pc++;  
            $(window).off("mousemove");
            create_line(e.pageX,e.pageY);     
        }
  
        else if (pc == 3) { 
            //special for 3rd point
            var bound1 = new Bound({x1: points[1].x, y1: points[1].y, x2: points[2].x, y2: points[2].y, ineq: "<"});
            if(!bound1.check_point(e.pageX, e.pageY)) {
                bound1 = new Bound({x1: points[1].x, y1: points[1].y, x2: points[2].x, y2: points[2].y, ineq: ">"});
            }
            bounds[1] = bound1;
            bounds[0]= bound1;
            check_if_valid_polygon_point(e.pageX,e.pageY);
        }
           
        else {       
            check_if_valid_polygon_point(e.pageX, e.pageY);
        }
        
    });

}


function create_path(e) {

    e.stopPropagation();

    var points = [];
    var pc = 1;
    var path_bounds = [];
    
    function create_line(x,y) {
        var line = $('<div/>', {
            class: "line",
            css: {"left": x, "top": y}
        });
        $("body").append(line);
        $(window).on("mousemove", function(e) {
            var width = Math.sqrt((x-e.pageX)*(x-e.pageX) + (y-e.pageY)*(y-e.pageY));
            var angle = Math.atan2(e.pageY - y, e.pageX - x)*180/Math.PI;
            var transform = 'rotate('+angle+'deg)';
            line.css({"width":width, "transform": transform});    
        });
    }
    
    
    function get_path_bound_trio(p1,p2) {
        var dx = (p2.x-p1.x);
        var dy = (-p2.y+p1.y);
        var angle = -Math.atan2(dy,dx);
        var s = 30*Math.sin(angle);
        var c = 30*Math.cos(angle);
        var ub_p1 = {x:p1.x+s, y: p1.y-c};
        var ub_p2 = {x: p2.x+s, y: p2.y-c};
        var lb_p1 = {x:p1.x-s, y: p1.y+c};
        var lb_p2 = {x: p2.x-s, y: p2.y+c};
        var u_ineq = angle >= Math.PI/2 || angle < -Math.PI/2 ? ">" : "<";
        var l_ineq = u_ineq == "<" ? ">" : "<";
        var g_ineq = angle <= 0 ? ">" : "<";
        var upper_bound =  new Bound({x1:ub_p1.x, y1:ub_p1.y, x2:ub_p2.x, y2:ub_p2.y, ineq: u_ineq})
        var lower_bound = new Bound({x1:lb_p1.x, y1:lb_p1.y, x2:lb_p2.x, y2:lb_p2.y, ineq: l_ineq})
        var goal_bound =  new Bound({x1:ub_p2.x, y1:ub_p2.y, x2:lb_p2.x, y2:lb_p2.y, ineq: g_ineq})
       
        return [upper_bound, lower_bound, goal_bound];
}
    

    ///////////////////////////////
    

    $(window).on("click", function(e) {
        
        points[pc] = {x:e.pageX, y: e.pageY};
        
        $(window).off("mousemove");
        create_line(e.pageX,e.pageY);
    
        var new_point = $("<div/>", {class: "point_dot"+" dot"+pc, 
            css: {"left":e.pageX, "top":e.pageY}
        });
        
        new_point.appendTo("body").animate(
            {"height":"10px","width":"10px","top":"-=5px","left":"-=5px"
        },100);
        
        pc++;
    });
        
    $(window).on("keypress", function(e) {
        if (e.which == 13 || e.which == 32) {
            $(window).off("click");
            $(window).off("keypress");
            $(window).off("mousemove");
            $(".line").last().remove();
            $(".line").remove();
            $(".point_dot").remove();
            
            for (i=1;i<points.length-1;i++) {
                path_bounds.push(get_path_bound_trio(points[i],points[i+1]));
            }
            
            worm_parameters.bounds = path_bounds;
            worm_parameters.init_left = points[1].x;
            worm_parameters.init_top = points[1].y;
            //worm_parameters.init_rotation = 
        }

    })
    
}



//bound constructor
function Bound(bound_info) {
    var bi = bound_info;
    var ineq_num = bi.ineq == ">" ? 1 : -1;
    var m = (-bi.y2+bi.y1)/(bi.x2-bi.x1);
    m = m == -Infinity ? Infinity : m;   
    this.check_point = function(x,y) {
        return (ineq_num)*(-y) > (ineq_num)*(m*(x-bi.x1)-bi.y1);
    }
    this.perp_angle = -Math.atan(m)*180/Math.PI - (ineq_num)*90;
}

//sequence builder
function build_seq(pipe_number, s_min, s_max, t_min, t_max, thickness, speed, all_pipes, r_min, r_max, init_top, init_left, init_rotation, bounds, path_mode) {

    var seq_of_seqs = []; 
    var full_500s = Math.floor(pipe_number/500);
    var remainder_pipes = pipe_number%500;
    var type_options = [Straight, C, CC];
    var abs_pos = {left: init_left, top: init_top, angle: init_rotation};  
    var flr = Math.floor;
    var rnd = Math.random;
    var rad = Math.PI/180;
    var sin = Math.sin;
    var cos = Math.cos;
    
    function Straight(custom_length) {
        this.type = "straight";
        this.length = custom_length || flr(rnd()*(s_max-s_min)+s_min); 
        this.duration = this.length*speed;
        this.wrap_left = (this.length-1)+"px";
        this.wrap_origin = "0px 0px"; 
        this.next_pipe_filter = 1;
    }
    
    function C(custom_degs, custom_radius) {
        this.type = "c";
        this.radius = custom_radius || flr(rnd()*(r_max-r_min)+r_min);
        this.degs = custom_degs || flr(rnd()*(t_max-t_min)+t_min); 
        this.arc_length = (this.radius+thickness/2)*this.degs*rad
        this.duration = this.arc_length*speed;
        this.wrap_left = "-1px";
        this.wrap_origin = "1px "+(this.radius+thickness)+"px";
        this.blocker_top = "0px";
        this.next_pipe_filter = 2;
    }
    
    function CC(custom_degs, custom_radius) {
         this.type = "cc";
         this.radius = custom_radius || flr(rnd()*(r_max-r_min)+r_min);
         this.degs = custom_degs || -flr(rnd()*(t_max-t_min)+t_min); 
         this.arc_length = -(this.radius+thickness/2)*this.degs*rad;
         this.duration = this.arc_length*speed;
         this.wrap_left = "-1px";
         this.wrap_origin = "1px -"+this.radius+"px";
         this.blocker_top = -(2*this.radius+thickness)+"px";
         this.next_pipe_filter = 0;
    }

    function update_abs_pos(type, radius, thickness, degs, length) {
        var k = type == "c" ? radius+thickness : -radius;
        var a = abs_pos.angle*rad;
        var ad = (abs_pos.angle+degs)*rad;
        if (type == "straight") {
            abs_pos.left += (length-1)*cos(a);
            abs_pos.top -= -(length-1)*sin(a);
            abs_pos.angle += 0;
        }
        else {
            abs_pos.left += (k)*sin(ad) - (k)*sin(a) - cos(ad);                        
            abs_pos.top -= (k)*cos(ad) - (k)*cos(a) + sin(ad);
            abs_pos.angle += degs;
        }
    }
    
    function check_in_or_out(left,top, bounds) {
        for (var i = 0; i<bounds.length; i++) {
            if (!bounds[i].check_point(left,top)) {
                return i;
            }
        }
        return -1;
    }
    
    function get_redirect_pipe(bounds, broken_bound_number) {
        var perp_angle = bounds[broken_bound_number].perp_angle;
        var temp_ref_angle = (((abs_pos.angle-perp_angle+180)%360+360)%360-180);    
//SHOULD I STILL CONSTRAIN BY MAX DEGS???       
        if (Math.abs(temp_ref_angle) <= 90) {
//TO ADD LOOSENESS AT EDGES, CHANGE THESE NUMBERS, BUT NNED TO BE CAREFUL OF GETTING MORE THAN 180 TEMP FIX IS TO MOD, BUT THIS DOUBLES OF THE PROBABILITY OF SOME ANGLES!!!
            var redirect_degs = (flr(rnd()*181)-90 - temp_ref_angle)%180 || 1; 
        }
        else {
//ALSO ADD LOOSENESS? BE CHANGING THESE NUMBERS, SO ITS NOT ALWAYS THROWING IT BACK TO PERPANGLE IN ONE TRY. BUT DOESNT WORK BECAUSE EVEN IT IT JUST TAKES IT TO 90, IF ITS STILL OUT, AND IT WILL MOST LIKELY BE, IT WILL JUST GET ANOTHER TURN IN SAME DIRECTION.
            var redirect_degs = Math.sign(temp_ref_angle)*flr(rnd()*91)-temp_ref_angle;
        }
        if (redirect_degs > 0) {
            var pipe = new C(redirect_degs);
        }
        else {
            var pipe = new CC(redirect_degs);
        }
        return pipe;
    }


    
    function actually_build_it() {
        if (path_mode) {
            var path_counter = 0;
            var bounds_trio = bounds[path_counter]; 
        }




  loop0:
    for (var j=0; j<full_500s; j++) {

        var seq = [];

      loop1:  
        for (var i=0; i<500; i++) {
        
            if (path_mode) {
                var broken_bound_number = check_in_or_out(abs_pos.left, abs_pos.top, bounds_trio);
            }
            else {
                var broken_bound_number = check_in_or_out(abs_pos.left, abs_pos.top, bounds);
            }
             
            
            //if worm is still in bounds
            if (broken_bound_number == -1) {
                if (path_mode) {
                    while (broken_bound_number == -1) {
                        if(!bounds[path_counter+1]) {
                            break loop0; ///////////////??????////////// also break loop1????
                        }
                        else {
                            path_counter++;
                            bounds_trio = bounds[path_counter];  
                            broken_bound_number = check_in_or_out(abs_pos.left, abs_pos.top, bounds_trio);
                        }
                    }
                    var pipe = get_redirect_pipe(bounds_trio, broken_bound_number);
                }
                else {
                    var type_filter = seq[i-1] ? seq[i-1].next_pipe_filter : flr(rnd()*3);
                    var constructor_index = all_pipes ? flr(rnd()*3) : flr(rnd()*2+type_filter)%3;            
                    var pipe = new type_options[constructor_index](); 
                }
            }
            //worm is out of bounds
            else { 
                if (path_mode) {
                    var pipe = get_redirect_pipe(bounds_trio, broken_bound_number)
                }
                else {
                    var pipe = get_redirect_pipe(bounds, broken_bound_number);
                }     
            }
            
            update_abs_pos(pipe.type, pipe.radius, thickness, pipe.degs, pipe.length);
            seq.push(pipe);

        }  

        seq_of_seqs.push(seq);


    } //end of loop0///////////

    var seq = [];

    loop2:  
        for (var i=0; i<remainder_pipes; i++) {
        
            if (path_mode) {
                var broken_bound_number = check_in_or_out(abs_pos.left, abs_pos.top, bounds_trio);
            }
            else {
                var broken_bound_number = check_in_or_out(abs_pos.left, abs_pos.top, bounds);
            }
             
            
            //if worm is still in bounds
            if (broken_bound_number == -1) {
                if (path_mode) {
                    while (broken_bound_number == -1) {
                        if(!bounds[path_counter+1]) {
                            break loop2; ///////////////??????////////// 
                        }
                        else {
                            path_counter++;
                            bounds_trio = bounds[path_counter];  
                            broken_bound_number = check_in_or_out(abs_pos.left, abs_pos.top, bounds_trio);
                        }
                    }
                    var pipe = get_redirect_pipe(bounds_trio, broken_bound_number);
                }
                else {
                    var type_filter = seq[i-1] ? seq[i-1].next_pipe_filter : flr(rnd()*3);
                    var constructor_index = all_pipes ? flr(rnd()*3) : flr(rnd()*2+type_filter)%3;            
                    var pipe = new type_options[constructor_index](); 
                }
            }
            //worm is out of bounds
            else { 
                if (path_mode) {
                    var pipe = get_redirect_pipe(bounds_trio, broken_bound_number)
                }
                else {
                    var pipe = get_redirect_pipe(bounds, broken_bound_number);
                }     
            }
            
            update_abs_pos(pipe.type, pipe.radius, thickness, pipe.degs, pipe.length);
            seq.push(pipe);

        }  

        seq_of_seqs.push(seq);









    } 
      
    /////////////////////////
   
    actually_build_it();
    return seq_of_seqs;
}

//DOM builder
function build_DOM(seq_of_seqs, init_top, init_left, init_rotation, thickness, color) {

    var seq = [].concat.apply([], seq_of_seqs);

    var tree = '';

    for (var i=seq.length-1; i>=0; i--) {
        var seq_i = seq[i];
        var prev_pipe = seq[i-1];           
        if (seq_i.type == "straight") {
            var new_pipe = '<div class="straight"></div>';   
        }
        else {
            var new_turn = '<div class="turn" style="'
                + 'left:' + (-seq_i.radius-thickness) + 'px;' 
                + 'height:' + (2*seq_i.radius) + 'px;'
                + 'width:' + (seq_i.radius) + 'px;'
                + 'border-radius:' + (seq_i.radius+thickness) + 'px 0px 0px ' + (seq_i.radius+thickness) + 'px;"></div>';
            var blocker_div_opening = '<div class="blocker ' + seq_i.type + 'blocker" style="'
                + 'top:' + seq_i.blocker_top + ';'
                + 'height:' + (2*seq_i.radius+2*thickness) + 'px;'
                + 'width:' + (seq_i.radius+thickness) + 'px;">' 
            var new_pipe = blocker_div_opening + new_turn + '</div>';
        }     
        if (prev_pipe) {
            tree = '<div class="wrap" style="'
                + 'left:' + prev_pipe.wrap_left + ';'
                + '-webkit-transform-origin:' + prev_pipe.wrap_origin + ';' 
                + '-ms-transform-origin:' + prev_pipe.wrap_origin + ';'
                + '-moz-transform-origin:' + prev_pipe.wrap_origin + ';'
                + 'transform-origin:' + prev_pipe.wrap_origin + ';' 
                + '-webkit-transform:rotate(' + prev_pipe.degs + 'deg);'
                + '-ms-transform:rotate(' + prev_pipe.degs + 'deg);'
                + '-moz-transform:rotate(' + prev_pipe.degs + 'deg);'
                + 'transform:rotate(' + prev_pipe.degs + 'deg);">'
                + new_pipe 
                + tree 
                + '</div>';   
        }
        else {
            tree = '<div class="wrap worm' + worm_counter + '" style="'
                + 'top:' + init_top + 'px;' 
                + 'left:' + init_left + 'px;'
                + '-webkit-transform-origin: 0px 0px;' 
                + '-ms-transform-origin: 0px 0px;' 
                + '-moz-transform-origin: 0px 0px;' 
                + 'transform-origin: 0px 0px;' 
                + '-webkit-transform:rotate(' + init_rotation + 'deg);'
                + '-ms-transform:rotate(' + init_rotation + 'deg);'
                + '-moz-transform:rotate(' + init_rotation + 'deg);'
                + 'transform:rotate(' + init_rotation + 'deg); ">' 
                + new_pipe 
                + tree 
                + '</div>';                 
        }   
    } 
  



          
    $("body").append(tree);    
    $(".worm" + worm_counter + " .straight").css({
        "border-top": thickness+"px solid "+color});  
    $(".worm" + worm_counter + " .turn").css({
        "border": thickness+"px solid "+color, 
        "border-right": "none"});         
}


function animate_worm(seq_of_seqs) {



    var seq = [].concat.apply([], seq_of_seqs);

    var all_wraps = $(".worm" + worm_counter).find(".wrap").addBack();

    function animate_pipe(i) {

        if (!seq[i]) {
            return;
        }     
        if (seq[i].type == "straight") {
            var next_pipe = $(all_wraps[i]).children(".straight").first();
            next_pipe.animate({"width": seq[i].length},
                seq[i].duration,
                "linear",
                function() {
                    i++;
                    animate_pipe(i);
                }
            );
        }
        else {
            var next_pipe = $(all_wraps[i]).children(".blocker").children().first();
            next_pipe.rotate({
                animateTo: seq[i].degs,
                duration: seq[i].duration,
                easing: function(x, t, b, c, d) {
                    return b+(t/d)*c;
                },
                callback: function() {
                    i++;
                    animate_pipe(i);
                }      
            });
        }
    }
    
    /////////////////////////
   
    animate_pipe(0);
}



function build_seq_DOM_and_animate(p) {
    var seq_of_seqs = build_seq(p.pipe_number, p.min_s, p.max_s, p.min_t, p.max_t, p.thickness, p.speed, p.all_pipes, p.min_r, p.max_r, p.init_top, p.init_left, p.init_rotation, p.bounds, p.path_mode);  
    build_DOM(seq_of_seqs, p.init_top, p.init_left, p.init_rotation, p.thickness, p.color);    
    animate_worm(seq_of_seqs);   
    worm_counter++;
}

 


























//begin a worm
$("#start_but").on("click", function() {
    build_seq_DOM_and_animate(worm_parameters);  
});

//opening and closing menu
$("#custom_but").on("click", toggle_menu);

//validate and update parameters from menu
$("input").on("change", validate_and_update);

$("input").on("keypress", function(e){
    if (e.which == 13 || e.which == 32) {
        $(this).blur();
    }
});

$("#set_polygon_but").on("click", function(e) {
    toggle_menu();  
    create_polygon_bounds(e);
});

$("#set_path_but").on("click", function(e) {
    worm_parameters.path_mode = true; //how to get this off if i change to no bounds or polygon?
    toggle_menu();
    create_path(e);
    
})
  








});






//make a single validate_menu function that checks everything and gives messages, call it on change?





//make no original bounds.

//two buttons. one says SQUIG, the other SET PATH.

//Then there is a drop down or side menu that you can use to customize worm. fill those out and save to save those. with a return to default button. when setting bounds, there is an option to click to make polygon, or you can enter in points and ineq signs and "Add" (with no validation).

//when custom menu is open, every 5 seconds it shoots a new worm out, that eitehr reverses, fades, or drifts off.