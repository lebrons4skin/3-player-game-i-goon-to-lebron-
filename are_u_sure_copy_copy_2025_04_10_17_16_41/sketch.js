class Character {
  constructor(name, x, y, imageSet) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.sizex = 150;
    this.sizey = 150;
    this.velocityY = 0;
    this.gravity = 2;
    this.isJumping = false;
    this.isAttacking = false;
    this.isBarrage = false;
    this.iscrouching = false;
    this.iscrouchattack = false;
    this.isCountering = false;
    this.isBlocking = false;
    this.isHit = false;
    this.hitCooldown = 0;
    this.state = "idle";
    this.sprites = imageSet;
    this.isMoving = false;
    this.counterTimer = 0;

    this.hitbox = {
      x: this.x + 30,
      y: this.y + 30,
      w: this.sizex - 60,
      h: this.sizey - 40
      
    };
  }

  updateHitbox() {
    this.hitbox.x = this.x + 30;
    this.hitbox.y = this.y + 30;
    if (this.isBarrage) {
      this.hitbox.x = this.x + 150;
      this.hitbox.w = this.sizex - 10;
    }
    else {
      this.hitbox.w = this.sizex - 60;
      this.hitbox.x = this.x + 30;
    }
  }

 move(leftKey, rightKey) {
    if (this.isAttacking || this.isHit || this.iscrouching) return;

    let moving = false;

    if (keyIsDown(leftKey) && !this.leftBlocked) {
        this.x -= 5;
        this.state = "left";
        moving = true;
    }
    if (keyIsDown(rightKey) && !this.rightBlocked) {
        this.x += 5;
        this.state = "right";
        moving = true;
    }

    this.isMoving = moving;
    
    
    if (!moving && !this.isJumping && !this.isAttacking && !this.isHit && !this.iscrouching) {
        this.state = "idle";
    }

    this.updateHitbox();
}

  jump(jumpKey) {
    if (!this.isJumping && keyIsDown(jumpKey) && !this.isAttacking && !this.isHit) {
      this.velocityY = -30;
      this.isJumping = true;
      this.state = "jump";
    }
    this.updateHitbox();
  }

  applyGravity() {
    if (this.isAttacking || this.isHit) return;
    
    this.y += this.velocityY;
    this.velocityY += this.gravity;
    
     if (this.velocityY < 0) {
      this.state = "jump";
    } else if (this.velocityY > 0 && this.isJumping) {
      this.state = "fall";
    }


    if (this.y >= 650) {
      this.velocityY = 0;
      this.isJumping = false;
      if (!this.isMoving && !this.isAttacking && !this.isHit) {
        this.state = "idle";
      }
    }

    this.updateHitbox();
  }

 attack(attackKey) {
    // If Dio is barraging, skip the attack animation
    if (this.isBarrage) return; // Prevent attack animation if barrage is active

    if (keyIsDown(attackKey) && !this.isBarrage) {
      this.isAttacking = true;
      this.state = "attack";
      setTimeout(() => {
        this.isAttacking = false;
        if (!this.isBarrage) {
          this.state = "idle"; // Set to idle if not barraging after the attack
        }
      }, 300); // Attack animation duration
    }
    this.updateHitbox();
}

// Barrage method
barrage(barrageKey) {
  if (keyIsDown(barrageKey) && !this.isMoving) {  // Use the key passed as a parameter
    this.isBarrage = true;
    this.isAttacking = true;
    this.state = "barrage";  // Set state to "barrage"
    
    setTimeout(() => {
      this.isBarrage = false;
      this.isAttacking = false;
      this.state = "idle";  // Reset to idle state after the animation finishes
    }, 1000);  // Adjust the timeout to match the length of the barrage animation
  }
  this.updateHitbox();
}

 crouchattack(cattackkey) {
    if (this.iscrouching && keyIsDown(cattackkey) && !this.isAttacking) {
        this.isAttacking = true;  // Mark as attacking
        this.iscrouchattack = true;  // Mark crouch attack state
        this.state = "cattack";  // Change to crouch attack state
        
        setTimeout(() => {
            this.isAttacking = false;  // Reset attacking after the animation duration
            this.iscrouchattack = false;  // Reset crouch attack flag
            this.state = "crouch";  // Reset to crouch state or idle
        }, 570);  // Duration of the attack animation (adjust accordingly)
    }
    this.updateHitbox();
}
 crouch(crouchKey) {
    if (keyIsDown(crouchKey) && !this.isMoving && !this.isJumping) {
        this.iscrouching = true;
        this.state = "crouch";
       // console.log("Crouch activated!");  // Debugging line
    } else if (!keyIsDown(crouchKey) && this.iscrouching) {
        this.iscrouching = false;
        this.state = "idle";
       // console.log("Crouch released.");
    }
    this.updateHitbox();
}

  getHit(attacker) {
    if (this.isHit || this.hitCooldown > 0 || this.isBlocking) return;
    
    if (attacker.isAttacking && this.collidesWith(attacker)) {
      if (this.isCountering) {
        this.counterAttack(attacker);
      } else {
        this.isHit = true;
        this.state = "hit";
        this.hitCooldown = 10;

        // Apply knockback
        this.x += (attacker.x < this.x) ? 35 : -35;
        
        setTimeout(() => {
          this.isHit = false;
          this.state = "idle";
        }, 200);
      }
    }
  }
 block(blockKey) {
    if (keyIsDown(blockKey)) {
      this.isBlocking = true;
      this.state = "block"; // Set to block state
    } else {
      this.isBlocking = false;

    }
   this.updateHitbox();
  }
  collidesWith(other) {
    return (
      this.hitbox.x < other.hitbox.x + other.hitbox.w &&
      this.hitbox.x + this.hitbox.w > other.hitbox.x &&
      this.hitbox.y < other.hitbox.y + other.hitbox.h &&
      this.hitbox.y + this.hitbox.h > other.hitbox.y 
      
    );
    
  }

  bump(...others) {
    this.leftBlocked = this.rightBlocked = false;

    for (let other of others) {
      if (this.collidesWith(other)) {
        if (this.x < other.x) {
          this.rightBlocked = true;
          other.leftBlocked = true;
        } else {
          this.leftBlocked = true;
          other.rightBlocked = true;
        }
      }
    }
  }

 counter(counterKey) {
    if (this.isAttacking || this.isHit) {
        console.log(`${this.name} can't counter (attacking or hit).`);
        return; 
    }

    if (keyIsDown(counterKey)) {
       
        this.isCountering = true;
        this.state = "counter";
        this.counterTimer = 30; // Counter lasts briefly
    }
}


  update() {
    if (this.hitCooldown > 0) this.hitCooldown--;

    if (this.isCountering) {
      this.counterTimer--;
      if (this.counterTimer <= 0) {
        this.isCountering = false;
        this.state = "idle";
      }
    }
    
  }

  counterAttack(attacker) {
    
    
    // Teleport behind attacker
    let offset = this.sizex + 20;
    this.x = (attacker.x < this.x) ? attacker.x + offset : attacker.x - offset;
    this.y = attacker.y;

    // Perform counter attack
    this.performCounterAttack(attacker);
    this.isCountering = false;
    this.state = "idle";
  }

  performCounterAttack(opponent) {
    
    opponent.isHit = true;

    setTimeout(() => {
      opponent.isHit = false;
      opponent.state = "idle";
    }, 200);
  }

display() {
  let spriteToShow = this.sprites[this.state];

  // If countering, force the counter sprite
  if (this.isCountering) {
    spriteToShow = this.sprites.counter;
  }
  if (this.iscrouching) {
    spriteToShow = this.sprites.crouch;
  }
  if (this.iscrouchattack) {
    spriteToShow = this.sprites.cattack;
  }
   if (this.isBlocking) {
        spriteToShow = this.sprites.block; // Show block sprite
    }

  // Handle barrage animation
  if (this.isBarrage) {
    // Show Dio's idle pose (without the stand) only once
    image(this.sprites.idle2, this.x, this.y, this.sizex, this.sizey);

    // Show Dio attacking during the barrage
      // Adjust accordingly for attack

    // Position The World next to Dio and show its barrage animation
    image(this.sprites.barrage, this.x + 160, this.y, this.sizex, this.sizey);
    
    // Adjust the +160 as needed for positioning
  } else {
    // Default behavior when not barraging
    image(spriteToShow, this.x, this.y, this.sizex, this.sizey);
  }

  // Debugging: Show a message if no image is found
  noFill();
  stroke(255, 0, 0);
  rect(this.hitbox.x, this.hitbox.y, this.hitbox.w, this.hitbox.h);
}
}


// Preload images
let sasukeSprites = {};
let ichigoSprites = {};
let sDioSprites = {};
let OmnimanSprites = {};
let dioIdle, dioLeft, dioRight, dioa4, dioa2, dioa3, dioa1, dioa5, dioUp,dioDown;
let dioSprites = {};
let map1;
function preload() {
  sasukeSprites.idle = loadImage("SasukeIdle.png");
  sasukeSprites.left = loadImage("SasukeLeft.gif");
  sasukeSprites.right = loadImage("SasukeRight.gif");
  sasukeSprites.attack = loadImage("SasukeSword.gif");
  sasukeSprites.jump = loadImage("SasukeJump.png");
  sasukeSprites.fall = loadImage("SasukeFall.png");
  sasukeSprites.hit = loadImage("SasukeHit.png"); // Add hit sprite
  
  OmnimanSprites.idle = loadImage("OmniIdle.gif");
  OmnimanSprites.left = 
    loadImage("OmniManLeft.copy.gif");
  OmnimanSprites.right = loadImage("OmniManRight.gif");
  OmnimanSprites.attack = loadImage("OmniCombo.gif");
  OmnimanSprites.jump = loadImage("OmnimanJump.png");
  OmnimanSprites.fall = loadImage("OmnimanFall.png");
  OmnimanSprites.hit = loadImage("OmnimanHit.png"); // Add hit sprite
  OmnimanSprites.block = loadImage("OmnimanGuard.png");

  ichigoSprites.idle = loadImage("IchigoIdleL.gif");
  ichigoSprites.left = loadImage("IchigoLeft.gif");
  ichigoSprites.right = loadImage("IchigoRight.gif");
  ichigoSprites.attack = loadImage("IchigoHeavyL.gif");
  ichigoSprites.jump = loadImage("IchigoJump.png");
  ichigoSprites.fall = loadImage("IchigoFall.gif");
  ichigoSprites.hit = loadImage("IchigoHit.png"); // Add hit sprite
  
   sDioSprites.idle = loadImage("shadowdio-intro.gif");
  sDioSprites.left = loadImage("shadowdio-walkb.gif")
  sDioSprites.right = loadImage("shadowdio-walk.gif")
  sDioSprites.attack = loadImage("Screenshot_2025-03-28_7.37.01_PM-removebg-preview.png")
  sDioSprites.jump = loadImage("Screenshot_2025-03-22_9.23.03_PM-removebg-preview.png");
  sDioSprites.fall = loadImage("Screenshot_2025-03-22_9.23.14_PM-removebg-preview.png")
  sDioSprites.hit = loadImage("Screenshot_2025-03-28_7.40.22_PM-removebg-preview.png")
  sDioSprites.counter = loadImage("Screenshot_2025-03-28_at_1.22.41_PM-removebg-preview (1).png")
  
   dioIdle = loadImage("dio-theworld.gif");
  dioLeft = loadImage("dio-walkb3.gif");
  dioRight = loadImage("dio-walkf3.gif");
  dioa2 = loadImage("dio-at2.gif");
  dioa3 = loadImage("dio-muda.gif");
  dioa4 = loadImage("dio-spinkick.gif");
  dioa1 = loadImage("Screenshot_2025-04-02_8.09.18_PM-removebg-preview.png");
  dioa5 = loadImage("dio-c2.gif");
  dioUp = loadImage("output-onlinegiftools.gif");
  dioDown = loadImage("output-onlinegiftools (2).gif")
  diocrouch = loadImage("Screenshot_2025-04-01_7.25.31_PM-removebg-preview.png")
  diocattack = loadImage("dio-c1.gif")
  diobarrage = loadImage("dio-theworld5.gif")
  dioidle2 = loadImage("dio-standing.gif")
   dioSprites.idle = dioIdle;
  dioSprites.left = dioLeft;
  dioSprites.right = dioRight;
  dioSprites.attack = dioa4;  
  dioSprites.hit = dioa1;
  dioSprites.jump = dioUp;
  dioSprites.fall = dioDown;
  dioSprites.crouch = diocrouch;
  dioSprites.cattack = diocattack;
  dioSprites.barrage = diobarrage;
  dioSprites.idle2 = dioidle2;
  map1 = loadImage('naruto_mobile_tencent___corner_scene_xps_obj_blend_by_o_dv89_o_dgfz4uu-pre.jpg')
}

// Initialize characters

let ichigo;
let shadowdio;
let dio;
function setup() {
  createCanvas(windowWidth, windowHeight);
dio = new Character("dio",500, 650, dioSprites);
Omniman = new Character("Omniman", 700, 650, OmnimanSprites);
shadowdio = new Character("Sdio", 300,650,sDioSprites)
  

}

function keyPressed() {
  if (key === 'v') {
    let fs = fullscreen();
    fullscreen(!fs); // This works only when triggered by user input
  }
}
  


function keyPressed() {
  if (key === 'v') {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  image(map1,0, 0, width, height)
//console.log("Dio State:", dio.state);
 
  // Update and check for attack collisions
  dio.update();
  Omniman.update();
  shadowdio.update();

  dio.attack(32);
  dio.crouchattack(17);
  dio.barrage(84);
  Omniman.attack(70);
  shadowdio.attack(80);

  dio.getHit(Omniman);
  Omniman.getHit(dio);
  shadowdio.getHit(Omniman, dio);
  
  shadowdio.counter(67);
  
  

  // Movement and gravity
  dio.move(LEFT_ARROW, RIGHT_ARROW, Omniman,shadowdio);
  dio.crouch(DOWN_ARROW);
  dio.jump(UP_ARROW);
  dio.applyGravity();
  dio.bump(shadowdio, Omniman);

  Omniman.move(65, 68, dio,shadowdio);
  Omniman.jump(87);
  Omniman.applyGravity();
  Omniman.bump(dio, shadowdio);
  Omniman.block(192);
  
  shadowdio.move(74, 76, dio,Omniman);
  shadowdio.jump(73);
  shadowdio.applyGravity();
   shadowdio.bump(dio, Omniman);
  

  // Display characters
  dio.display();
  Omniman.display();
  shadowdio.display();
  
 dio.x = constrain(dio.x, 0, width - 150);
   Omniman.x = constrain(Omniman.x, 0, width - 150);
  shadowdio.x = constrain(shadowdio.x, 0, width - 150);
  console.log(windowWidth, windowHeight)
  fill('black')
  text(mouseX + ", " + mouseY, 20, 20)
}
// fix dios sprites and add new animations and like a cool stand on/off attack moveset