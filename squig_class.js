//CAN OPTIMAIZE ANIMATION TO BE SMOOTH?? WHATS THE ISSUE, RECURSIVE??
///MAKE LENGTH NOT PIPE NUMBER BUT ACTUAL LENGTH IN PX?
$(document).ready(function() {

    var flr = Math.floor;
    var rnd = Math.random;
    var sin = Math.sin;
    var cos = Math.cos;
    var to_rad = Math.PI / 180;
    var to_deg = 180 / Math.PI;

    class Pipe {

        to_DOM_pipe(prev_pipe) {

            function new_DOM_pipe(pipe) {
                var DOM_turn;
                var DOM_blocker;

                if (pipe instanceof Straight) 
                    return ('<div class="straight' + (pipe.squig.show_divs ? ' show' : '') + '" style="' + 
                            'border-top:' + pipe.squig.width + 'px solid ' + pipe.squig.color + ';"></div>');
                else {
                    DOM_turn    = '<div class="turn' + (pipe.squig.show_divs ? ' show' : '') + '" style="' +
                                  'border:' + pipe.squig.width + 'px solid ' + pipe.squig.color + ';' +
                                  'border-right:none;' +
                                  'left:' + (-pipe.radius - pipe.squig.width) + 'px;' +
                                  'height:' + (2 * pipe.radius) + 'px;' +
                                  'width:' + pipe.radius + 'px;' +
                                  'border-radius:' + (pipe.radius + pipe.squig.width) + 'px ' +
                                  '0px 0px ' + (pipe.radius + pipe.squig.width) + 'px;"></div>';
                    DOM_blocker = '<div class="blocker" style="' +
                                  'top:' + pipe.blocker_top + 'px;' +
                                  'height:' + (2 * pipe.radius + 2 * pipe.squig.width) + 'px;' +
                                  'width:' + (pipe.radius + pipe.squig.width) + 'px;">';
                    return (DOM_blocker + DOM_turn + '</div>');
                }
            }

            function new_DOM_wrap(squig, prev_pipe) {
                var wrap_opening;

                if (prev_pipe == undefined) {
                    var left   = squig.init_left;
                    var top    = squig.init_top;
                    var origin = '0px 0px';
                    var degs   = squig.init_angle;
                }
                else {
                    var left   = prev_pipe.wrap_left;
                    var top    = '';
                    var origin = prev_pipe.wrap_origin;
                    var degs   = prev_pipe.degs;
                }
                wrap_opening = '<div class="wrap' + 
                               (prev_pipe ? '' : ' squig' + squig.squig_i) + 
                               (squig.show_wraps ? ' show' : '') + 
                               '" style="' + 
                               'left:' + left + 'px;' +
                               'top:' + top + 'px;' +
                               'transform-origin:' + origin + ';' +
                               'transform:rotate(' + degs + 'deg);">';
                return (wrap_opening);
            }

            return (new_DOM_wrap(this.squig, prev_pipe) + new_DOM_pipe(this));
        }
    }

    class Straight extends Pipe {

        constructor(squig) {
            super();
            this.squig            = squig;
            this.length           = flr(rnd() * (squig.max_s - squig.min_s) + squig.min_s); 
            this.duration         = this.length * squig.speed;
            this.wrap_left        = (this.length - 1);
            this.wrap_origin      = "0px 0px"; 
            this.next_pipe_filter = 1;
        }
    }

    class Cturn extends Pipe {

        constructor(squig, redirect_degs) {
            super();
            this.squig            = squig;
            this.radius           = flr(rnd() * (squig.max_r - squig.min_r) + squig.min_r);
            this.degs             = redirect_degs || (flr(rnd() * (squig.max_t - squig.min_t) + squig.min_t)); 
            this.arc_length       = (this.radius + squig.width / 2) * this.degs * to_rad;
            this.duration         = this.arc_length * squig.speed;
            this.wrap_left        = -1;
            this.wrap_origin      = "1px " + (this.radius + squig.width) + "px";
            this.blocker_top      = 0;
            this.next_pipe_filter = 2;
        }
    }

    class CCturn extends Pipe {

        constructor(squig, redirect_degs) {
            super();
            this.squig            = squig;
            this.radius           = flr(rnd() * (squig.max_r - squig.min_r) + squig.min_r);
            this.degs             = redirect_degs || (-flr(rnd() * (squig.max_t - squig.min_t) + squig.min_t)); 
            this.arc_length       = -(this.radius + squig.width / 2) * this.degs * to_rad;
            this.duration         = this.arc_length * squig.speed;
            this.wrap_left        = -1;
            this.wrap_origin      = "1px -" + this.radius + "px";
            this.blocker_top      = -(2 * this.radius + squig.width);
            this.next_pipe_filter = 0;
        }
    }

    Bound = class Bound {

        constructor(bound_info) {
            this.x1   = bound_info.x1;
            this.x2   = bound_info.x2;
            this.y1   = bound_info.y1;
            this.y2   = bound_info.y2;
            this.m    = (-this.y2 + this.y1) / (this.x2 - this.x1);
            this.ineq = (bound_info.ineq == ">" ? 1 : -1);
            this.perp = -Math.atan(this.m) * to_deg - this.ineq * 90;
        }

        check_point(x, y) {
            return ((this.ineq * -y) > (this.ineq * (this.m * (x - this.x1) - this.y1)));
        }
    }

    Squig = class Squig {

        constructor(parameters) {
            this.squig_i     = parameters.squig_i;
            this.pipes       = parameters.pipes;
            this.width       = parameters.width;
            this.color       = parameters.color;
            this.speed       = parameters.speed;
            this.min_s       = parameters.min_s;
            this.max_s       = parameters.max_s;
            this.min_t       = parameters.min_t;
            this.max_t       = parameters.max_t;
            this.min_r       = parameters.min_r;
            this.max_r       = parameters.max_r;
            this.init_left   = parameters.init_left;
            this.init_top    = parameters.init_top;
            this.init_angle  = parameters.init_angle;
            this.repeats     = parameters.repeats;
            this.path_bounds = parameters.path_bounds;
            this.win_bounds  = parameters.win_bounds;
            this.show_divs   = parameters.show_divs;
            this.show_wraps = parameters.show_wraps;
            this.seq         = [];
        }

        build_seq() {

            var pipe_types = [Straight, Cturn, CCturn];
            var abs_pos    = {left: this.init_left, top: this.init_top, angle: this.init_angle};  

            function update_abs_pos(pipe) {
                var a  = abs_pos.angle * to_rad;
                var ad = (abs_pos.angle + pipe.degs) * to_rad;
                var k  = (pipe instanceof Cturn ? pipe.radius + pipe.squig.width : -pipe.radius);
                if (pipe instanceof Straight) {
                    abs_pos.left += (pipe.length - 1) * cos(a);
                    abs_pos.top  += (pipe.length - 1) * sin(a);
                }
                else {
                    abs_pos.left  += k * sin(ad) - k * sin(a) - cos(ad);                        
                    abs_pos.top   -= k * cos(ad) - k * cos(a) + sin(ad);
                    abs_pos.angle += pipe.degs;
                }
            }

            function out_of_bounds(abs_pos, bounds) {
                for (var i = 0; i < bounds.length; i++)
                    if (!bounds[i].check_point(abs_pos.left, abs_pos.top))
                        return i;
                return -1;
            }

            function get_redirect_pipe(squig, broken_bound) {
                var redirect_degs;
                var temp_ref_angle = (((abs_pos.angle - broken_bound.perp + 180) % 360 + 360) % 360 - 180);    
                //SHOULD I STILL CONSTRAIN BY MAX DEGS???       
                if (Math.abs(temp_ref_angle) <= 90)
                //TO ADD LOOSENESS AT EDGES, CHANGE THESE NUMBERS, BUT NNED TO BE CAREFUL OF GETTING MORE THAN 180 TEMP FIX IS TO MOD, BUT THIS DOUBLES OF THE PROBABILITY OF SOME ANGLES!!!
                    redirect_degs = ((flr(rnd() * 181) - 90 - temp_ref_angle) % 180) || 1; 
                else
                //ALSO ADD LOOSENESS? BE CHANGING THESE NUMBERS, SO ITS NOT ALWAYS THROWING IT BACK TO PERPANGLE IN ONE TRY. BUT DOESNT WORK BECAUSE EVEN IT IT JUST TAKES IT TO 90, IF ITS STILL OUT, AND IT WILL MOST LIKELY BE, IT WILL JUST GET ANOTHER TURN IN SAME DIRECTION.
                    redirect_degs = Math.sign(temp_ref_angle) * flr(rnd() * 91) - temp_ref_angle;
                return (new pipe_types[1 + (redirect_degs <= 0)](squig, redirect_degs));
            }

            function build_path_seq(squig) {
                var path_count  = 0;
                var total_paths = squig.path_bounds.length;
                var bounds_trio = squig.path_bounds[path_count];
                var broken_bound_i;
                var pipe;
                while (path_count < total_paths) {
                    broken_bound_i = out_of_bounds(abs_pos, bounds_trio);
                    if (broken_bound_i == -1) {
                        path_count++;
                        bounds_trio = squig.path_bounds[path_count];
                    }
                    else {
                        pipe = get_redirect_pipe(squig, bounds_trio[broken_bound_i]);
                        update_abs_pos(pipe);
                        squig.seq.push(pipe);
                    }
                }
            }

            function build_reg_seq(squig) {
                var broken_bound_i;
                var type_filter;
                var type_i;
                var pipe;
                for (var i = 0; i < squig.pipes; i++) {   ///change so its length not pipes?
                    broken_bound_i = out_of_bounds(abs_pos, squig.win_bounds);
                    if (broken_bound_i == -1) {
                        type_filter = (i > 0 ? squig.seq[i - 1].next_pipe_filter : flr(rnd() * 3));
                        type_i = squig.repeats ? flr(rnd() * 3) : flr(rnd() * 2 + type_filter) % 3;
                        pipe = new pipe_types[type_i](squig);
                    }
                    else
                        pipe = get_redirect_pipe(squig, squig.win_bounds[broken_bound_i]);
                    update_abs_pos(pipe);
                    squig.seq.push(pipe);
                }
            }

            if (this.path_bounds.length > 0)
                build_path_seq(this);
            else
                build_reg_seq(this);
        }

        build_DOM() {

            var curr_pipe;
            var prev_pipe;
            var tree;
            var last_wrap;
            var full_500s = flr(this.seq.length / 500);
            var remainder = this.seq.length % 500;

            for (var j = 0; j < full_500s; j++) {
                tree = '';
                for (var i = 499; i >= 0; i--) {
                    curr_pipe = this.seq[j * 500 + i];
                    prev_pipe = this.seq[j * 500 + i - 1];
                    tree = curr_pipe.to_DOM_pipe(prev_pipe) + tree + '</div>';
                }
                if (j == 0)
                    $("body").append(tree);
                else {
                    last_wrap = $(".squig" + this.squig_i).find(".wrap")[j * 500 - 2];
                    $(last_wrap).append(tree);
                }
            }
            tree = '';
            for (var i = remainder - 1; i >= 0; i--) {
                curr_pipe = this.seq[full_500s * 500 + i];
                prev_pipe = this.seq[full_500s * 500 + i - 1];
                tree = curr_pipe.to_DOM_pipe(prev_pipe) + tree + '</div>';
            }
            if (full_500s == 0)
                $("body").append(tree);
            else {
                last_wrap = $(".squig" + this.squig_i).find(".wrap")[full_500s * 500 - 2];
                $(last_wrap).append(tree);
            }
        }

        animate_squig() {

            var all_wraps = $(".squig" + this.squig_i).find(".wrap").addBack();
            var next_DOM_pipe;

            function animate_pipe(seq, i) {
                if (!seq[i])
                    return;
                if (seq[i] instanceof Straight) {
                    next_DOM_pipe = $(all_wraps[i]).children(".straight").first(); 
                    next_DOM_pipe.animate({"width": seq[i].length},
                        seq[i].duration,
                        "linear",
                        function() {
                        animate_pipe(seq, i + 1);
                    });
                }
                else {
                    next_DOM_pipe = $(all_wraps[i]).children(".blocker").children().first();  ////here too
                    next_DOM_pipe.rotate({animateTo: seq[i].degs,
                        duration: seq[i].duration,
                        easing: function(x, t, b, c, d) {
                            return b + ( t / d) * c;
                        },
                        callback: function() {
                            animate_pipe(seq, i + 1);
                        }
                    });
                }
            }
       
            animate_pipe(this.seq, 0);
        }
    }

});