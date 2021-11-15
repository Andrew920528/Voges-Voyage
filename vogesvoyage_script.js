var sketchProc = function(processingInstance) {
    with(processingInstance) {
        width = 600;
        height = 400;
        //size(screen_x, screen_y);
        frameRate(30);
        //Global
        var version = 1.0;
        angleMode = "radians";
        var gameStart = false;
        var drawManual = false;
        var win = false;
        var lose = false;

        /*****************************
         * Ship object
         ****************************/
        {
            var Ship = function() {
                this.position = new PVector(width / 2, height / 2);
                this.velocity = new PVector(0, 0);
                this.acceleration = new PVector(0, 0);
                this.maxSpeed = 2;
                this.angle = 0;
                //to change the size of the ship
                this.headX = 20;
                this.headY = 0;
                this.shipH = 10;
                this.shipW = 20;
                //boost
                this.boostOver = 1;
                this.boostTime = 0;
                this.notBoostTime = 0;
            };
            /*************************************
             * Ship Setup (force and display)
             **************************************/
            {
                Ship.prototype.display = function() {
                    // Setup
                    rectMode(CORNER);
                    if (this.velocity.mag() !== 0) {
                        this.angle = this.velocity.heading();
                    }
                    stroke(0, 0, 0);
                    strokeWeight(2);
                    fill(127, 127, 127);
                    pushMatrix();
                    translate(this.position.x, this.position.y);
                    //scale(6);
                    rotate(this.angle);
                    // draw the space ship
                    fill(255, 255, 255);
                    triangle(this.headX, this.headY, this.headX - this.shipW, this.headY + this.shipH / 2, this.headX - this.shipW, this.headY - this.shipH / 2);
                    //thruster
                    rect(this.headX - this.shipW, this.headY + this.shipH / 2, -this.shipW / 5, -this.shipH / 3);
                    rect(this.headX - this.shipW, this.headY - this.shipH / 2, -this.shipW / 5, this.shipH / 3);
                    //fire and boost mechanics
                    if (gameStart === true) { //only display fire when game starts
                        //boostOver>=1 means the ship is not boosting
                        if (this.boostOver < 1) {
                            //if is boosting, max speed is larger
                            this.maxSpeed = 5;
                            //animate the motion of fire
                            if (this.boostTime < 10) {
                                noStroke();
                                fill(230, 39, 39);
                                ellipse(this.headX - this.shipW - this.shipW / 2.5, this.headY + this.shipH / 3, 5, 5);
                                ellipse(this.headX - this.shipW - this.shipW / 2.5, this.headY - this.shipH / 3, 5, 5);
                                this.boostTime++;
                            } else if (this.boostTime < 20) {
                                noStroke();
                                fill(230, 39, 39, 40);
                                ellipse(this.headX - this.shipW - this.shipW / 2.5, this.headY + this.shipH / 3, 5, 5);
                                ellipse(this.headX - this.shipW - this.shipW / 2.5, this.headY - this.shipH / 3, 5, 5);
                                fill(240, 129, 70);
                                ellipse(this.headX - this.shipW - this.shipW / 1.5, this.headY + this.shipH / 3, 3, 3);
                                ellipse(this.headX - this.shipW - this.shipW / 1.5, this.headY - this.shipH / 3, 3, 3);
                                this.boostTime++;
                            } else if (this.boostTime < 30) {
                                noStroke();
                                fill(240, 129, 70, 40);
                                ellipse(this.headX - this.shipW - this.shipW / 1.5, this.headY + this.shipH / 3, 3, 3);
                                ellipse(this.headX - this.shipW - this.shipW / 1.5, this.headY - this.shipH / 3, 3, 3);
                                fill(255, 191, 0);
                                ellipse(this.headX - this.shipW - this.shipW / 1.15, this.headY + this.shipH / 3, 2, 2);
                                ellipse(this.headX - this.shipW - this.shipW / 1.15, this.headY - this.shipH / 3, 2, 2);
                                this.boostTime++;
                            } else if (this.boostTime < 50) {
                                noStroke();
                                fill(255, 191, 0, 40);
                                ellipse(this.headX - this.shipW - this.shipW / 1.15, this.headY + this.shipH / 3, 2, 2);
                                ellipse(this.headX - this.shipW - this.shipW / 1.15, this.headY - this.shipH / 3, 2, 2);
                                this.boostTime++;
                            } else {
                                this.boostTime = 0;
                                this.boostOver += 0.2;
                                //println(this.boostOver);
                            }
                        } else { //when the ship is not boosting
                            this.maxSpeed = 2;
                            //animate cloud coming out of the shipz
                            if (this.notBoostTime < 10) {
                                noStroke();
                                fill(186, 186, 186);
                                ellipse(this.headX - this.shipW - this.shipW / 2.5, this.headY + this.shipH / 3, 5, 5);
                                ellipse(this.headX - this.shipW - this.shipW / 2.5, this.headY - this.shipH / 3, 5, 5);
                                this.notBoostTime++;
                            } else if (this.notBoostTime < 20) {
                                noStroke();
                                fill(186, 186, 186, 40);
                                ellipse(this.headX - this.shipW - this.shipW / 2.5, this.headY + this.shipH / 3, 5, 5);
                                ellipse(this.headX - this.shipW - this.shipW / 2.5, this.headY - this.shipH / 3, 5, 5);
                                fill(245, 245, 245);
                                ellipse(this.headX - this.shipW - this.shipW / 1.5, this.headY + this.shipH / 3, 3, 3);
                                ellipse(this.headX - this.shipW - this.shipW / 1.5, this.headY - this.shipH / 3, 3, 3);
                                this.notBoostTime++;
                            } else if (this.notBoostTime < 30) {
                                noStroke();
                                fill(245, 245, 245, 40);
                                ellipse(this.headX - this.shipW - this.shipW / 1.5, this.headY + this.shipH / 3, 3, 3);
                                ellipse(this.headX - this.shipW - this.shipW / 1.5, this.headY - this.shipH / 3, 3, 3);
                                fill(255, 255, 255);
                                ellipse(this.headX - this.shipW - this.shipW / 1.15, this.headY + this.shipH / 3, 2, 2);
                                ellipse(this.headX - this.shipW - this.shipW / 1.15, this.headY - this.shipH / 3, 2, 2);
                                this.notBoostTime++;
                            } else if (this.notBoostTime < 50) {
                                noStroke();
                                fill(255, 255, 255, 40);
                                ellipse(this.headX - this.shipW - this.shipW / 1.15, this.headY + this.shipH / 3, 2, 2);
                                ellipse(this.headX - this.shipW - this.shipW / 1.15, this.headY - this.shipH / 3, 2, 2);
                                this.notBoostTime++;
                            } else {
                                this.notBoostTime = 0;
                            }
                        }
                    }
                    popMatrix();
                };

                Ship.prototype.checkEdges = function() {
                    var theta = this.angle;
                    var dx;
                    var dy;
                    //defining dx of special angle
                    if (theta <= PI / 90 && theta >= -1 * PI / 90) { //for angle that is too horizontal to the right
                        dx = width;
                    } else if (theta >= 89 * PI / 90 || theta <= -89 * PI / 90) { //for angle that is too horizontal to the left
                        dx = -1 * width;
                    } else if (theta >= PI / 2 - PI / 90 && theta <= PI / 2 + PI / 90 || theta <= -1 * PI / 2 + PI / 90 && theta >= -1 * PI / 2 - PI / 90) { //for angle that is nearly vertical
                        dx = 0;
                    }
                    //defining dy of special angle
                    if (theta <= PI / 90 && theta >= -1 * PI / 90 || theta >= 89 * PI / 90 || theta <= -89 * PI / 90) { //for angle that is too horizontal
                        dy = 0;
                    } else if (theta >= PI / 2 - PI / 90 && theta <= PI / 2 + PI / 90) { //for angle that is downwardly (positively) vertical 
                        dy = height;
                    } else if (theta <= -1 * PI / 2 + PI / 90 && theta >= -1 * PI / 2 - PI / 90) { //for angle that is upwardly (negatively) vertical 
                        dy = -1 * height;
                    }

                    //dealing with left and right wall, calculate dx first
                    if (this.position.x > width || this.position.x < 0) {
                        if (this.velocity.y < 0 && dx !== -1 * width && dx !== width) { //when ship heads upward, dy=this.position.y-height
                            dx = (this.position.y - height) * (1 / (tan(theta)));
                        } else if (this.velocity.y > 0 && dx !== -1 * width && dx !== width) { //when ship heads downward, dy=this.position.y
                            dx = (this.position.y) * (1 / (tan(theta)));
                        }
                        //constrain
                        if (dx > width) { dx = width; } else if (dx < -1 * width) { dx = -1 * width; }
                        dy = dx * tan(theta);
                        if (dy > height) { dy = height; } else if (dy < -1 * height) { dy = -1 * height; }
                    }
                    //dealing with up and down walls, calculate dy first
                    if (this.position.y > height || this.position.y < 0) {
                        if (this.velocity.x < 0) { //when ship heads leftward, dx=this.position.x-width
                            dy = (this.position.x - width) * tan(theta);
                        } else if (this.velocity.x > 0) { //when ship heads rightward, dx=this.position.x
                            dy = (this.position.x) * tan(theta);
                        }
                        //constrain
                        if (dy > height) { dy = height; } else if (dy < -1 * height) { dy = -1 * height; }
                        dx = dy * (1 / tan(theta));
                        if (dx > width) { dx = width; } else if (dx < -1 * width) { dx = -1 * width; }
                    }
                    //after defining dx and dy in each context, we are good to go
                    if (this.position.y > height || this.position.y < 0 || this.position.x > width || this.position.x < 0) {
                        this.position.x = this.position.x - dx;
                        this.position.y = this.position.y - dy;
                    }
                };

                Ship.prototype.update = function() {
                    this.velocity.add(this.acceleration);
                    this.velocity.limit(this.maxSpeed);
                    this.position.add(this.velocity);
                    this.acceleration.mult(0);
                };

                Ship.prototype.run = function() {
                    ship.checkEdges();
                    //because the display of fire involves changing the max speed, so display should be placed before update function
                    ship.display();
                    ship.update();
                };

                Ship.prototype.applyForce = function(force) {
                    this.acceleration.add(force);
                };
            }
            /**********************************
             * Below are keyboard controls
             **********************************/
            {
                Ship.prototype.turnLeft = function() {
                    println("turning left!");
                    this.velocity.rotate(-PI / 6);
                };

                Ship.prototype.turnRight = function() {
                    println("turning right!");
                    this.velocity.rotate(PI / 6);
                };

                Ship.prototype.thrust = function() {
                    if (this.boostOver >= 1) {
                        var thrustForce = new PVector(cos(this.angle), sin(this.angle));
                        thrustForce.mult(8);
                        this.applyForce(thrustForce);
                        this.boostOver = 0;
                        // println("boost!");
                    }
                };

            }

            var ship = new Ship();
        }

        /****************************
         * bullets object
         ***************************/
        var Bullet = function(ship) {
            this.position = new PVector(ship.position.x, ship.position.y);
            this.velocity = new PVector(0, 0);
            this.angle = 0
        }
        Bullet.prototype.update = function() {
            this.position.add(this.velocity);
        };
        Bullet.prototype.display = function() {
            strokeWeight(5);
            stroke(158, 235, 235);
            pushMatrix();
            translate(this.position.x + 20 * cos(this.angle), this.position.y + 20 * sin(this.angle))
            rotate(this.angle)
            ellipse(0, 0, 7, 3);
            stroke(255, 255, 255);
            ellipse(2, 0, 0.5, 0.5);
            popMatrix();
        };
        Bullet.prototype.shoot = function(ship) {
            this.position.x = ship.position.x;
            this.position.y = ship.position.y;

            this.velocity.x = 3 * ship.velocity.x;
            this.velocity.y = 3 * ship.velocity.y;
            this.angle = this.velocity.heading();
        };
        bullet = new Bullet(ship);

        //Controls
        keyPressed = function() {
            if (gameStart === true) {
                if (keyCode === 37) {
                    ship.turnLeft();
                } else if (keyCode === 39) {
                    ship.turnRight();
                } else if (keyCode === 90) {
                    ship.thrust();
                } else if (keyCode === 88) {
                    println(this.angle)
                    println("shoot!")

                    bullet.shoot(ship);
                }
            }
        };
        /****************************
         * meteor object
         ***************************/
        {
            var Meteor = function() {
                //constant
                this.angle = 0;
                this.color = color(115, 60, 21);
                this.shadowColor = color(89, 40, 5, 150);
                this.maxSpeed = 2;
                this.diameter = 50;
                this.radius = this.diameter / 2;
                //change everytime respawned
                this.size = random(0.5, 2);
                this.mass = this.size;
                this.rotateDir = random(0, 1);
                this.position = new PVector(random(0, width), random(0, height));
                this.velocity = new PVector(random(-0.2, 0.2), random(-0.2, 0.2));
                this.acceleration = new PVector(1 / this.mass, 1 / this.mass);
                if (this.velocity.x < 0) {
                    this.acceleration.x = -1 * this.acceleration.x;
                }
                if (this.velocity.y < 0) {
                    this.acceleration.y = -1 * this.acceleration.y;
                }


            };
            //draw meteor
            Meteor.prototype.display = function() {
                //rotate the meteor
                if (this.rotateDir < 0.5) {
                    this.angle += PI / 180;
                } else {
                    this.angle -= PI / 180;
                }
                strokeWeight(2);
                stroke(0, 0, 0);
                fill(this.color);
                pushMatrix();
                translate(this.position.x, this.position.y);
                rotate(this.angle);
                scale(this.size);
                ellipse(0, 0, this.diameter, this.diameter);
                ellipse(this.diameter / 80, this.diameter / 80, this.diameter * 0.3, this.diameter * 0.3);
                pushMatrix();
                rotate(-0.4);
                ellipse(this.diameter * 27 / 80, this.diameter * 3 / 80, this.diameter * 0.2, this.diameter * 0.4);
                popMatrix();
                pushMatrix();
                rotate(0.9);
                ellipse(this.diameter * -32 / 80, this.diameter * -1 / 80, this.diameter * 0.1, this.diameter * 0.3);
                popMatrix();
                pushMatrix();
                rotate(3.7);
                ellipse(0, this.diameter * -29 / 80, this.diameter * 0.5, this.diameter * 0.2);
                popMatrix();
                popMatrix();
                noStroke();
                fill(this.shadowColor);
                pushMatrix();
                translate(this.position.x - this.diameter * 5 / 80, this.position.y - this.diameter * 4 / 80);
                scale(this.size * 0.9);
                rotate(this.angle);
                ellipse(0, 0, this.diameter, this.diameter);
                ellipse(this.diameter * 1 / 80, this.diameter * 1 / 80, this.diameter * 0.3, this.diameter * 0.3);
                pushMatrix();
                rotate(-0.4);
                ellipse(this.diameter * 27 / 80, this.diameter * 3 / 80, this.diameter * 0.2, this.diameter * 0.4);
                popMatrix();
                pushMatrix();
                rotate(0.9);
                ellipse(this.diameter * -32 / 80, this.diameter * -1 / 80, this.diameter * 0.1, this.diameter * 0.3);
                popMatrix();
                pushMatrix();
                rotate(3.7);
                ellipse(0, this.diameter * -29 / 80, this.diameter * 0.5, this.diameter * 0.2);
                popMatrix();
                popMatrix();

            };
            Meteor.prototype.respawn = function() {
                var luckX = random(0, 1);
                if (luckX > 0.5) {
                    this.position.x = 10;
                    this.velocity.x = random(0.1, 0.2);
                } else {
                    this.position.x = width - 10;
                    this.velocity.x = random(-0.2, -0.1);
                }
                this.position.y = random(0, height);
                this.velocity.y = random(-0.2, 0.2);
                this.size = random(0.5, 2);
                this.mass = this.size * 1.5;
                this.rotateDir = random(0, 1);
                this.acceleration = new PVector(1 / this.mass, 1 / this.mass);
                if (this.velocity.x < 0) {
                    this.acceleration.x = -1 * this.acceleration.x;
                }
                if (this.velocity.y < 0) {
                    this.acceleration.y = -1 * this.acceleration.y;
                }
            }
            Meteor.prototype.checkCollide = function(object, object_radius) {
                var d = dist(object.position.x, object.position.y, this.position.x, this.position.y);
                var hitBox = this.radius * this.size + object_radius;
                //if they hit, let the fly reappear a few seconds later(by moving it downward)
                if (d < hitBox) {
                    this.respawn();
                }
            }
            Meteor.prototype.checkEdges = function() {
                if (this.position.x > width || this.position.x < 0 || this.position.y > height || this.position.y < 0) {
                    this.respawn();
                }
            };
            Meteor.prototype.update = function() {
                this.velocity.add(this.acceleration);
                this.velocity.limit(this.maxSpeed);
                this.position.add(this.velocity);
                this.acceleration.mult(0);
            };
            Meteor.prototype.run = function() {
                this.display();
                this.checkCollide(ship, 0);
                this.checkEdges();
                this.update();
            };
            meteor = [];
            for (var i = 0; i < 5; i++) {
                meteor[i] = new Meteor();
            }
        }

        /***************************
         * gravity meteor 
         ***************************/
        {
            var G_meteor = function() {
                Meteor.call(this);
                //customize some variables
                this.color = color(207, 71, 98);
                this.shadowColor = color(135, 31, 49, 150);
                this.velocity = new PVector(0, 0);
                this.acceleration = new PVector(0, 0);
                this.size = random(0.7, 1.2);
                this.G = 240;
                this.affected_radius = this.radius * this.size * 7;
            }

            G_meteor.prototype = Object.create(Meteor.prototype);
            G_meteor.prototype.constructor = G_meteor;
            G_meteor.prototype.feature = function() {
                fill(240, 183, 197, 80);
                ellipse(this.position.x, this.position.y, this.affected_radius * 2, this.affected_radius * 2);
            };
            G_meteor.prototype.attract = function(mover) {
                // Calculate direction of force
                var force = PVector.sub(this.position, mover.position);
                // Distance between objects       
                var distance = force.mag();
                if (distance > this.affected_radius) {
                    force.mult(0);
                } else {
                    // Limiting the distance to eliminate "extreme" results
                    // for very close or very far objects                            
                    distance = constrain(distance, 5, this.affected_radius);
                    // Normalize vector                    
                    force.normalize();
                    // Calculate gravitional force magnitude  
                    var strength = (this.G * this.mass) / (distance * distance);
                    // Get force vector --> magnitude * direction
                    force.mult(strength);
                }
                return force;
            };
            G_meteor.prototype.respawn = function() {
                this.position = new PVector(random(0, width), random(0, height));
                this.velocity = new PVector(0, 0);
                this.acceleration = new PVector(0, 0);
            }
            g_meteor = [];
            for (var i = 0; i < 1; i++) {
                g_meteor[i] = new G_meteor();
            }

        }
        /******************
         *Button Object Type
         *******************/
        {
            var Button = function(config) {
                this.x = config.x;
                this.y = config.y;
                this.width = config.width;
                this.height = config.height;
                this.label = config.label;
                this.color = config.color;
                this.textColor = config.textColor;
                this.onClick = config.onClick;
            };

            //draw the button
            Button.prototype.draw = function() {
                noStroke();
                if (this.isMouseInside()) {
                    strokeWeight(2);
                    stroke(255, 255, 255);
                    fill(this.color);
                } else {
                    fill(this.color);
                }
                rectMode(CENTER);
                rect(this.x, this.y, this.width, this.height, 5);
                fill(this.textColor);
                textSize(19);
                textAlign(CENTER, CENTER);
                text(this.label, this.x, this.y);
            };
            Button.prototype.update = function(config) {
                this.x = config.x;
                this.y = config.y;
            };
            //check if mouse cursor is inside the button
            Button.prototype.isMouseInside = function() {
                return mouseX > this.x - this.width / 2 &&
                    mouseX < (this.x + this.width / 2) &&
                    mouseY > this.y - this.height / 2 &&
                    mouseY < (this.y + this.height / 2);
            };

            //handle mouse clicks for the button
            Button.prototype.handleMouseClick = function() {
                if (this.isMouseInside()) {
                    this.onClick();
                }
            };
            //create start button
            var start = new Button({
                x: width / 2,
                y: height * 2 / 3,
                width: 132,
                height: 36,
                label: "Start Voyage!",
                color: color(35, 138, 176),
                textColor: color(255, 255, 255),
                onClick: function() {
                    gameStart = true;
                    ship.velocity.x = 1;
                }
            });

            //how to play button
            var howToPlay = new Button({
                x: width / 2,
                y: height * 0.8,
                width: 132,
                height: 36,
                label: "How to Play",
                color: color(35, 138, 176),
                textColor: color(255, 255, 255),
                onClick: function() {
                    drawManual = true;
                }
            });
            //back button
            var back = new Button({
                x: width * 0.5,
                y: height * 0.85,
                width: 69,
                height: 36,
                label: "Got it!",
                color: color(35, 138, 176),
                textColor: color(255, 255, 255),
                onClick: function() {
                    drawManual = false;
                }
            });
            //restart button
            var restart = new Button({});

            //full screen button
            var full_screen = new Button({
                x: width * 0.90,
                y: height * 0.10,
                width: 100,
                height: 36,
                label: "Full Screen",
                color: color(35, 138, 176),
                textColor: color(255, 255, 255),
                onClick: function() {
                    width = 900;
                    height = 600;
                    ship.position.x = width / 2;
                    ship.position.y = height / 2;
                    start.update({
                        x: width / 2,
                        y: height * 2 / 3,
                    });
                    howToPlay.update({
                        x: width / 2,
                        y: height * 0.8,
                    });
                    back.update({
                        x: width * 0.5,
                        y: height * 0.85,
                    });
                    full_screen.update({})
                }
            });


            mouseClicked = function() {
                start.handleMouseClick();
                howToPlay.handleMouseClick();
                back.handleMouseClick();
                full_screen.handleMouseClick();
            };
        }


        /**************************
         * draw different scenes
         *************************/
        {
            //how to play
            var manual = function() {
                fill(23, 45, 77);
                rect(width / 2, height / 2, width, height);
                fill(255, 255, 255, 150);
                rect(width / 2, height / 2, width * 0.8, height * 0.8, 5);
                fill(255, 255, 255);
                textSize(20);
                text("So you press z to boost \n and use arrow keys \n to control left and right", width * 0.5, height * 0.25);
                back.draw();
            };
            //home page
            var home = function() {
                ship.run();
                start.draw();
                howToPlay.draw();
                full_screen.draw();
                textSize(40);
                text("Voges' Voyage", width / 2, height * 0.3);
                strokeWeight(5);
                stroke(255, 255, 255);
                line(width * 0.2, height * 0.4, width * 0.8, height * 0.4);
            };
            //gameScene
            var gameScene = function() {
                ship.run();
                //draw meteor
                for (var i = 0; i < meteor.length; i++) {
                    meteor[i].run();
                    for (var j = 0; j < meteor.length; j++) {
                        if (j != i) {
                            meteor[i].checkCollide(meteor[j], meteor[j].radius * meteor[j].size);
                        }
                    }
                }
                for (var i = 0; i < g_meteor.length; i++) {
                    g_meteor[i].run();
                    g_meteor[i].feature();
                    ship.applyForce(g_meteor[i].attract(ship));
                }
            };

            var winScene = function() {};
            var loseScene = function() {};
        }

        /*****************
         * Scene Logic
         *******************/
        {
            var logic = function() {
                //before the game
                if (gameStart === false && drawManual === true) {
                    //instruction page
                    manual();
                }
                if (gameStart === false && drawManual === false) {
                    //home page
                    home();
                }
                //during the game
                if (gameStart === true && !win && !lose) {
                    gameScene();
                }
                //after the game
                if (win) {
                    winScene();
                }
                if (lose) {
                    loseScene();
                }
            };
        }
        /*****************
         *draw function
         ****************/
        draw = function() {
            size(width, height);
            background(22, 28, 61);
            bullet.display();
            bullet.update();
            logic();
            //println(ship.angle)
            //println(bullet.position)
        };

    }
};

// Get the canvas that Processing-js will use
var canvas = document.getElementById("mycanvas");
// Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
var processingInstance = new Processing(canvas, sketchProc);