var sketchProc = function(processingInstance) {
    with(processingInstance) {
        /*****************************
         * Global Variables
         ****************************/
        {
            width = 600;
            height = 400;
            //size(screen_x, screen_y);
            frameRate(30);
            //Global
            var version = "1.0";
            angleMode = "radians";
            var loading = true;
            var gameStart = false;
            var drawManual = false;
            var win = false;
            var lose = false;
            var goal = 5000;
            var score = 0;
            var life = 3;
            var highScore = 0;
            var freePlay = false;
            var muted = false;
        }
        /*****************************
         * keep track of stats
         ****************************/
        {
            var reset = function() {
                gameStart = false;
                drawManual = false;
                win = false;
                lose = false;
                score = 0;
                freePlay = false;
                resetBtn();
            };
            var checkLife = function(ship) {
                if (ship.life <= 0) {
                    lose = true;
                }
            };
            var checkWin = function(score) {
                if (score >= goal) {
                    win = true;
                }
            };
            var updateHighScore = function(score, highScore) {
                if (highScore < score) {
                    textSize(25);
                    text("New High Score!", width * 0.5, height * 0.55);
                    highScore = score;
                }
                textSize(14);
                text("Score: " + score, width * 0.5, height * 0.65);
                text("High Score: " + score, width * 0.5, height * 0.70);
            }

        }
        /*****************************
         * interface
         ****************************/
        {
            var drawScore = function() {
                textSize(18);
                fill(255, 255, 255);
                text("Score: " + score, width * 0.80, height * 0.075);
                text("Goal: " + goal, width * 0.80, height * 0.15);
            };
            var drawShip = function(x, y, ship) {
                stroke(0, 0, 0);
                strokeWeight(2);
                fill(127, 127, 127);
                pushMatrix();
                translate(x, y);
                //scale(6);
                rotate(-1 * PI / 2);
                // draw the space ship
                fill(255, 255, 255);
                triangle(ship.headX, ship.headY, ship.headX - ship.shipW, ship.headY + ship.shipH / 2, ship.headX - ship.shipW, ship.headY - ship.shipH / 2);
                //thruster
                rect(ship.headX - ship.shipW, ship.headY + ship.shipH / 2, -ship.shipW / 5, -ship.shipH / 3);
                rect(ship.headX - ship.shipW, ship.headY - ship.shipH / 2, -ship.shipW / 5, ship.shipH / 3);
                popMatrix();
            };
            var drawLife = function(ship) {
                for (var i = 0; i < ship.life; i++) {
                    drawShip(0.05 * width + 20 * i, 0.1 * height, ship);
                }
            };
            var drawBoost = function(ship) {
                if (ship.boostOver === 1) {
                    noStroke();
                    noStroke();
                    fill(255, 242, 0);
                    pushMatrix();
                    translate(width * 0.025, height * 0.2);
                    scale(0.1);
                    triangle(220, 100, 295, 100, 177, 200);
                    translate(470, 200);
                    rotate(PI);
                    triangle(220, 100, 295, 100, 177, 200);
                    popMatrix();
                }
            }

            var drawAmmo = function(x, y) {
                strokeWeight(5);
                stroke(158, 235, 235);
                pushMatrix();
                translate(x, y)
                rotate(-1 * PI / 2)
                ellipse(0, 0, 7, 3);
                stroke(255, 255, 255);
                ellipse(2, 0, 0.5, 0.5);
                popMatrix();
            };
            var drawRemainingAmmo = function(ship, bul) {
                for (var i = 0; i < ship.ammo - bul.length; i++) {
                    drawAmmo(0.05 * width + 20 * i, 0.15 * height)
                }
            }

        }
        /*****************************
         * Ship object
         ****************************/
        {
            var Ship = function() {
                this.id = "ship";
                this.position = new PVector(width / 2, height / 2);
                this.velocity = new PVector(0, 0);
                this.acceleration = new PVector(0, 0);
                this.maxSpeed = 2.5;
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
                // bullet
                this.ammo = 4;

                // life
                this.life = life;
            };
            /*************************************
             * Ship Setup (force and display)
             **************************************/
            {
                Ship.prototype.reset = function() {
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
                    // bullet
                    this.ammo = 4;
                    // life
                    this.life = life;
                }
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
             * Below are ship controls
             **********************************/
            {
                Ship.prototype.turnLeft = function() {
                    // println("turning left!");
                    this.velocity.rotate(-PI / 6);
                };

                Ship.prototype.turnRight = function() {
                    // println("turning right!");
                    this.velocity.rotate(PI / 6);
                };

                Ship.prototype.thrust = function() {
                    if (this.boostOver >= 1) {
                        zoom_audio.currentTime = 0;
                        zoom_audio.play();
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
        {
            var Bullet = function(ship) {
                this.id = "bullet";
                this.position = new PVector(ship.position.x, ship.position.y);
                this.velocity = new PVector(0, 0);
                this.angle = 0;
                this.life = 40;
                this.isDead = false;
                // after the bullet is dead, wait for the cooldown to fire
                this.cooldown = 40;
            }
            Bullet.prototype.update = function() {
                this.position.add(this.velocity);
                this.life--;
                if (this.life < 0) {
                    this.isDead = true;
                }
            };
            Bullet.prototype.cd = function() {
                this.cooldown--;
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
                this.velocity.x = 3.5 * ship.velocity.x;
                this.velocity.y = 3.5 * ship.velocity.y;
                this.angle = this.velocity.heading();
            };

            var bullets = []
            var createNewBullet = function() {
                bullets.unshift(new Bullet(ship));
                // println(bullets.length)
            };
            var doBullet = function(bul) {
                for (var i = 0; i < bul.length; i++) {
                    if (!bul[i].isDead) {
                        bul[i].display();
                        bul[i].update();
                    } else {
                        bul[i].cd();
                    }
                    if (bul[i].cooldown <= 0) {
                        bul.pop();
                    }
                }
            };
        }
        /****************************
         * audio objects
         ***************************/
        {
            var shoot_audio = new Audio('laser.mp3');
            var explosion_audio = new Audio('explosion.mp3');
            var hit_audio = new Audio('hit.mp3');
            var zoom_audio = new Audio('zoom.mp3');
            var buttonHovered_audio = new Audio('buttonHovered.mp3');
            var buttonClicked_audio = new Audio('buttonClicked.mp3');
            var bgm1_audio = new Audio('bgm1.mp3');
            shoot_audio.volume = 1;
            explosion_audio.volume = 0.01;
            hit_audio.volume = 0.02;
            zoom_audio.volume = 0.05;
            buttonHovered_audio.volume = 0.1;
            buttonClicked_audio.volume = 0.1;
            bgm1_audio.volume = 0.01;
            var mute = function() {
                shoot_audio.volume = 0;
                explosion_audio.volume = 0;
                hit_audio.volume = 0;
                zoom_audio.volume = 0;
                buttonHovered_audio.volume = 0;
                buttonClicked_audio.volume = 0;
                bgm1_audio.volume = 0;
                muted = true;
            };
            var unmute = function() {
                shoot_audio.volume = 1;
                explosion_audio.volume = 0.01;
                hit_audio.volume = 0.02;
                zoom_audio.volume = 0.05;
                buttonHovered_audio.volume = 0.1;
                buttonClicked_audio.volume = 0.1;
                bgm1_audio.volume = 0.001;
                muted = false;
            };
        }
        /************
         * Controls
         *************/
        {
            keyPressed = function() {
                if (gameStart === true) {
                    if (keyCode === 37) {
                        ship.turnLeft();
                    } else if (keyCode === 39) {
                        ship.turnRight();
                    } else if (keyCode === 90) {
                        ship.thrust();
                    } else if (keyCode === 88) {
                        if (bullets.length < ship.ammo) {
                            // println(this.angle);
                            // println("shoot!");
                            shoot_audio.currentTime = 0;
                            shoot_audio.play();
                            createNewBullet();
                            bullets[0].shoot(ship);
                        }

                    }
                }
            };
        }

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
                // score
                this.metScore = 100;
                this.life = 2;


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
                this.life = 2;
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
                if (d < hitBox) {
                    if (object.id === "ship") {
                        object.life--;
                        explosion_audio.currentTime = 0;
                        explosion_audio.play();
                        this.respawn();
                    }
                    if (object.id === "bullet") {
                        //println("hot");
                        score += this.metScore;
                        this.life -= 1;
                        if (this.life != 0) {
                            hit_audio.currentTime = 0;
                            hit_audio.play();
                        }
                        object.isDead = true;
                    }
                    if (this.life === 0) {
                        explosion_audio.currentTime = 0;
                        explosion_audio.play();
                        this.respawn();
                    }
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
                for (var i = 0; i < bullets.length; i++) {
                    if (!bullets[i].isDead) {
                        this.checkCollide(bullets[i], 3);
                    }
                }
                this.checkEdges();
                this.update();
            };
            //create more meteor as game progresses
            var makeMore = false;
            var prior = 0;
            var now = 0;
            var instance = new Meteor();
            var make = function(item, mark, type) {
                now = score;
                if (now - prior >= mark) {
                    makeMore = true;
                    prior = now;
                }
                if (makeMore === true) {
                    item.push(type);
                    makeMore = false;
                }
            };
            var resetMeteor = function(met, init) {
                makeMore = false;
                prior = 0;
                now = 0;
                if (met.length > init) {
                    // println("hi");
                    extra = met.length - init;
                    // println(extra);
                    met = met.slice(extra);
                    // println(met);

                }
                return met;
            };
            // create meteor system
            var meteor = [];
            for (var i = 0; i < 5; i++) {
                meteor[i] = new Meteor();
            }

            var doMeteor = function(met) {
                for (var i = 0; i < met.length; i++) {
                    met[i].run();
                    for (var j = 0; j < met.length; j++) {
                        if (j != i) {
                            met[i].checkCollide(met[j], met[j].radius * met[j].size);
                        }
                    }
                }
                instance = new Meteor();
                make(met, 1000, instance);
            };
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
                this.life = 3;
                this.G = 300;
                this.affected_radius = this.radius * this.size * 7;
                this.metScore = 150;
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
                this.life = 3;
            }
            g_meteor = [];
            for (var i = 0; i < 1; i++) {
                g_meteor[i] = new G_meteor();
            }
            var instanceG = new G_meteor();
            var doGMeteor = function(g_met, ship) {
                for (var i = 0; i < g_met.length; i++) {
                    g_met[i].run();
                    g_met[i].feature();
                    ship.applyForce(g_met[i].attract(ship));
                }
                instanceG = new G_meteor();
                make(g_met, 3000, instanceG);
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
                this.exist = false;
                this.hoverSound = true;
            };
            //draw the button
            Button.prototype.draw = function() {
                noStroke();
                if (this.isMouseInside()) {
                    strokeWeight(2);
                    stroke(255, 255, 255);
                    fill(this.color);
                    if (this.hoverSound) {
                        this.hoverSound = false;
                        buttonHovered_audio.currentTime = 0;
                        buttonHovered_audio.play();
                    }
                } else {
                    fill(this.color);
                    this.hoverSound = true;
                }
                rectMode(CENTER);
                rect(this.x, this.y, this.width, this.height, 5);
                fill(this.textColor);
                textSize(19);
                textAlign(CENTER, CENTER);
                text(this.label, this.x, this.y);
                this.exist = true;
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
            Button.prototype.reset = function() {
                    this.exist = false;
                }
                //handle mouse clicks for the button
            Button.prototype.handleMouseClick = function() {
                if (this.isMouseInside() && this.exist) {
                    buttonClicked_audio.currentTime = 0;
                    buttonClicked_audio.play();
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
                    resetBtn();
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
                    resetBtn();
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
                    resetBtn();
                }
            });
            //restart button
            var restart = new Button({
                x: width * 0.5,
                y: height * 0.85,
                width: 69,
                height: 36,
                label: "Restart",
                color: color(35, 138, 176),
                textColor: color(255, 255, 255),
                onClick: function() {
                    reset();
                    // println("before reset:" + meteor);
                    meteor = resetMeteor(meteor, 5);
                    g_meteor = resetMeteor(g_meteor, 1);
                    // println("after reset:" + meteor);
                    ship.reset();
                    resetBtn();
                }
            });
            // free play button
            var freePlayBtn = new Button({
                x: width * 0.5,
                y: height * 0.85,
                width: 90,
                height: 36,
                label: "Free Play",
                color: color(35, 138, 176),
                textColor: color(255, 255, 255),
                onClick: function() {
                    freePlay = true;
                    gameStart = true;
                    win = false;
                    resetBtn();
                }
            });
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
                    restart.update({
                        x: width * 0.5,
                        y: height * 0.85,
                    })
                    freePlayBtn.update({
                        x: width * 0.5,
                        y: height * 0.85,
                    })
                    muteBtn.update({
                        x: width * 0.1,
                        y: height * 0.1,
                    })
                    unmuteBtn.update({
                        x: width * 0.1,
                        y: height * 0.1,
                    })
                    full_screen.update({});
                    resetBtn();
                }
            });
            // mute button
            var muteBtn = new Button({
                x: width * 0.1,
                y: height * 0.1,
                width: 80,
                height: 36,
                label: "Mute",
                color: color(35, 138, 176),
                textColor: color(255, 255, 255),
                onClick: function() {
                    mute();
                    resetBtn();
                }
            });
            var unmuteBtn = new Button({
                x: width * 0.1,
                y: height * 0.1,
                width: 80,
                height: 36,
                label: "Unmute",
                color: color(35, 138, 176),
                textColor: color(255, 255, 255),
                onClick: function() {
                    unmute();
                    resetBtn();
                }
            });

            var resetBtn = function() {
                start.reset();
                howToPlay.reset();
                back.reset();
                full_screen.reset();
                restart.reset();
                freePlayBtn.reset();
                muteBtn.reset();
                unmuteBtn.reset();
            };
            mouseClicked = function() {
                loading = false;
                start.handleMouseClick();
                howToPlay.handleMouseClick();
                back.handleMouseClick();
                full_screen.handleMouseClick();
                restart.handleMouseClick();
                freePlayBtn.handleMouseClick();
                muteBtn.handleMouseClick();
                unmuteBtn.handleMouseClick();
            };
        }
        /**************************
         * draw different scenes
         *************************/
        {
            //load Screen
            var loadScreen = function() {
                textSize(30);
                textAlign(CENTER, CENTER);
                text("Click To Start", width / 2, height * 0.45);
                //loading = false;
            };
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
                bgm1_audio.play();
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
                textSize(14);
                text("ver " + version, width * 0.5, height * 0.9);
                if (muted) {
                    unmuteBtn.draw();
                } else {
                    muteBtn.draw();
                }
                bgm1_audio.play();
            };
            //gameScene
            var gameScene = function() {
                // run ship
                ship.run();
                // run bullet
                doBullet(bullets);
                // run meteors
                doMeteor(meteor);
                doGMeteor(g_meteor, ship);
                // keep track of win or lose
                checkLife(ship);
                if (!freePlay) {
                    checkWin(score);
                }
                drawScore();
                drawLife(ship);
                drawRemainingAmmo(ship, bullets);
                drawBoost(ship);
                bgm1_audio.play();
            };

            var winScene = function() {
                freePlayBtn.draw();
                textSize(40);
                text("Mission Completed!", width / 2, height * 0.3);
                updateHighScore(score, highScore);
                bgm1_audio.play();
            };
            var loseScene = function() {
                restart.draw();
                if (!freePlay) {
                    textSize(40);
                    text("Mission Failed...", width / 2, height * 0.4);
                } else {
                    textSize(40);
                    text("Super Pilot!", width / 2, height * 0.4);
                }
                updateHighScore(score, highScore);
                bgm1_audio.play();
            };
        }

        /*****************
         * Scene Logic
         *******************/
        {
            var logic = function() {
                //load screen
                if (loading) {
                    loadScreen();
                } else {
                    //before the game
                    if (gameStart === false && drawManual === false) {
                        //home page
                        home();
                    }
                    if (gameStart === false && drawManual === true) {
                        //instruction page
                        manual();
                    }
                    //during the game
                    if ((gameStart === true && !win && !lose)) {
                        gameScene();
                    }
                    //after the game
                    if (win && !freePlay) {
                        winScene();
                    }
                    if (lose) {
                        loseScene();
                    }
                }
            };
        }
        /*****************
         *draw function
         ****************/
        {
            draw = function() {
                size(width, height);
                background(22, 28, 61);
                //println(score);
                //println(ship.life);
                logic();
                //println(ship.angle)
                //println(bullet.position);
                // println(meteor.length);
            };
        }


    }
};

// Get the canvas that Processing-js will use
var canvas = document.getElementById("mycanvas");
// Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
var processingInstance = new Processing(canvas, sketchProc);