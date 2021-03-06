
// http://stackoverflow.com/questions/10892322/javascript-hashtable-use-object-key
// http://stackoverflow.com/questions/194846/is-there-any-kind-of-hash-code-function-in-javascript

// http://www.html5gamedevs.com/topic/4227-decrease-collision-box-size/

Hungry = {

    'startgame': function () {

	var shooting = false;
	var hash_id = 0;
	const SCORING_SIZE = 3;
	const SHOT_FOOD_SPIN = 350; // angular velocity of shot food
	const ACTION_DELAY = 2;
	const ADJUST_DELAY = 8;

	function create_tostring_function() {
	    var id = hash_id;
	    hash_id++;

	    return function() {
		return "object_" + id;
	    }
	}

	var map_objtoset = {};

	function create_set_for_item(item) {
	    var set = {};
	    set[item] = item;
	    map_objtoset[item] = set;

	    if (item.hasOwnProperty('hhfoodset')) {
		// should not happen??
	    }
	    item.hhfoodset = set; // buh
	    return set;
	}

	// add item to same set that nitem is in
	function add_to_food_set(nitem, item) {
	    var set = null;
	    if (!(nitem in map_objtoset)) {
		set = create_set_for_item(nitem);
	    } else {
		set = map_objtoset[nitem];
		// OR:
		// set = nitem.hhfoodset;
	    }
	    set[item] = item;
	    map_objtoset[item] = set;

	    if (item.hasOwnProperty('hhfoodset')) {
		// should not happen??
	    }
	    item.hhfoodset = set; // buh
	    return set;
	}

	function construct_food_sets(colwidth, foodarray) {
	    for (var i = 0; i < foodarray.length; i++) {
		if (foodarray[i] != null && !(foodarray[i] in map_objtoset)) {
		    // figure out which neighbours to check
		    // 0   1   2   3   4   5   6   7
		    // 8   9  10  11  12  13  14  15
		    //
		    // If we're on "3" we need to look at 4, 10, 11, and 12
		    // to see if they're the same food type.
		    // NOTE: actually we should look backwards too...
		    // So also 2, and the previous row.
		    //
		    // But if we're on 7 we don't check 8, and if we're on 8 we don't check 7...
		    //
		    // So if (i mod colwidth) = (colwidth - 1), or = 0 are special cases.
		    //
		    var neighbours = [];

		    if ((i % colwidth) == (colwidth - 1)) {
			// at the end of a row
			neighbours.push(i     - colwidth);
			neighbours.push(i - 1 - colwidth);
			neighbours.push(i - 1 + colwidth);
			neighbours.push(i     + colwidth);

		    } else if (i % colwidth == 0) {
			// at the beginning of a row
			neighbours.push(i     - colwidth);
			neighbours.push(i + 1 - colwidth);
			neighbours.push(i + 1);
			neighbours.push(i     + colwidth);
			neighbours.push(i + 1 + colwidth);
		    } else {
			neighbours.push(i - 1 - colwidth);
			neighbours.push(i     - colwidth);
			neighbours.push(i + 1 - colwidth);
			neighbours.push(i + 1);
			neighbours.push(i - 1);
			neighbours.push(i - 1 + colwidth);
			neighbours.push(i     + colwidth);
			neighbours.push(i + 1 + colwidth);
		    }

		    // now filter out nieghbour indices that are beyond the end of the array
		    // and also are not null in foodarray
		    neighbours = neighbours.filter(function(val) {
			if (val < 0 || val >= foodarray.length) {
			    return false;
			}
			var item = foodarray[val];
			return item != null;
		    })

		    // now check to see if neighbours are the same type of food as "i"
		    var nmatched = false;
		    for (var n=0; n < neighbours.length; n++) {
			var nitem = foodarray[neighbours[n]]; // neighbouritem
			var item = foodarray[i];

			if (item.key == nitem.key) {
			    add_to_food_set(nitem, item); // add item to same set that nitem is in
			    nmatched = true;
			    break;
			}
		    }

		    // if no neighbours matched then this is in a set by itself...
		    if (!nmatched) {
			create_set_for_item(item);
		    }
		}
	    }

	}

	var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
	var foodobj;
	var food;
	var player_sprite;
	var targetline;
	var shoot_velocity = 250;
	var currently_shot_food = null;


	var foods = [
	    'beetle',
	    'slug',
	    'worm',
	    'frog',
	    'earwig'
	];

	// for collision detection
	var foodbounds = {
	    'beetle' : { 'h': 80, 'w': 60 },
	    'slug'   : { 'h': 60, 'w': 80 },
	    'worm'   : { 'h': 50, 'w': 80 },
	    'frog'   : { 'h': 60, 'w': 80 },
	    'earwig' : { 'h': 40, 'w': 80 }
	};

	function random_food() {
	    var item = foods[Math.floor(Math.random()*foods.length)];
	    return item;
	}

	function food_present_p(chance) {
	    return Math.random() <= chance;
	}

	function init_foods() {

	    var food_present_chance = 0.65;

	    food = game.add.group();
	    food.enableBody = true;

	    var foodObj = {
		'random_food': random_food,
		'food': food,
		'foodgrid' : null,

		'food_group': foods, // lol

		'random_food_grid': function() {
		    var tmargin = 35;
		    var lmargin = 200;
		    var width = 50;
		    var height = 45;
		    // size of grid is 9x7
		    console.log("A");
		    food.removeAll(true);
		    foodgrid = null;

		    var foodarray = [];
		    var rows = 5;
		    var columns = 8;

		    for (var j = 0; j < rows; j++) {

			for (var i = 0; i < columns; i++)
			{
			    console.log("in loop");
			    //  Create a star inside of the 'stars' group
			    if (!food_present_p(food_present_chance)) {
				foodarray.push(null);
				continue;
			    }
			    var food_type = random_food();
			    var f = food.create(lmargin + i * width, tmargin + j * height, food_type);
			    f.anchor.setTo(0.5,0.5);
			    f.angle = Math.floor(Math.random() * 360);
			    f.body.setSize(foodbounds[food_type].w, foodbounds[food_type].h, 10, 10);
			    f.toString = create_tostring_function();
			    f.scale.setTo(0.5,0.5);

			    foodarray.push(f);
			}
		    }

		    construct_food_sets(columns, foodarray);
		}
	    }

	    return foodObj;
	}

	function preload() {
	    game.load.image('sky', 'assets/sky.png');
	    game.load.image('hedgehog', 'assets/hedgehogsmall.png');
	    game.load.image('targetline', 'assets/targetline.png');
	    game.load.image('rotateleft', 'assets/rotateleft.png');
	    game.load.image('rotateright', 'assets/rotateright.png');

	    game.load.image('beetle', 'assets/beetlesmall.png');
	    game.load.image('slug', 'assets/slugsmall.png');
	    game.load.image('worm', 'assets/wormsmall.png');
	    game.load.image('frog', 'assets/frogsmall.png');
	    game.load.image('earwig', 'assets/earwigsmall.png');

	    game.load.audio('wallbounce', 'assets/wallbouncesound.mp3');
	    game.load.audio('foodland', 'assets/foodlandsound.mp3');
	    game.load.audio('shoot', 'assets/leapoutsound.mp3');
	    game.load.audio('eat', 'assets/eatfood1sound.mp3');
	    game.load.audio('adjust', 'assets/metaltickle.mp3');

	    game.load.audio('fm1', 'assets/foodmove1.mp3');
	    game.load.audio('fm2', 'assets/foodmove2.mp3');
	    game.load.audio('fm3', 'assets/foodmove3.mp3');
	    game.load.audio('fm4', 'assets/foodmove4.mp3');
	}

	function create() {
	    //game.add.sprite(0, 0, 'star');
	    //  We're going to be using physics, so enable the Arcade Physics system
	    game.physics.startSystem(Phaser.Physics.ARCADE);

	    //  A simple background for our game
	   // game.add.sprite(0, 0, 'sky');
	    game.stage.backgroundColor = "#4488AA";

	    // The player and its settings
	    player = game.add.sprite(375, game.world.height - 150, 'hedgehog');
	    // ugh global variable
	    player_sprite = player;
	    player.anchor.setTo(0.5, 0.5);

	    //targetline = game.add.sprite(375, game.world.height, "targetline");
	    targetline = game.add.sprite(350, 500, "targetline");
	    targetline.alpha = 0.25;
	    targetline.anchor.setTo(0.0,1.0);

	    // init touch controls
	    game.input.addPointer();
	    game.input.mouse.capture = true;
	    //game.input.multiInputOverride = Phaser.Input.TOUCH_OVERRIDES_MOUSE;
	    rotate_left_button = game.add.sprite(100,game.world.height - 70,'rotateleft');
	    rotate_left_button.scale.setTo(0.15,0.15);
	    rotate_right_button = game.add.sprite(600,game.world.height - 70,'rotateright');
	    rotate_right_button.scale.setTo(0.15,0.15);


	    //  We need to enable physics on the player
	    game.physics.arcade.enable(player);

	    //  Player physics properties. Give the little guy a slight bounce.
	    player.body.bounce.y = 0.2;
	    player.body.gravity.y = 300;
	    player.body.collideWorldBounds = true;

	    foodobj = init_foods();
	    food = foodobj.random_food_grid();

	    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	    init_food_on_nose();

	    init_sounds();
	}

	var sounds = {};
	function init_sounds() {
	    sounds["wallbounce"] = game.add.audio('wallbounce');
	    sounds["foodland"] = game.add.audio('foodland');
	    sounds["shoot"] = game.add.audio('shoot');
	    sounds["eat"] = game.add.audio('eat');
	    sounds["adjust"] = game.add.audio('adjust');

	    sounds["fm1"] = game.add.audio('fm1');
	    sounds["fm2"] = game.add.audio('fm2');
	    sounds["fm3"] = game.add.audio('fm3');
	    sounds["fm4"] = game.add.audio('fm4');
	}

	function play_sound(snd) {
	    var sound = sounds[snd];
	    sound.play();
	}

	function play_random_food_move_sound() {
	    var snd = Math.floor(Math.random() * 4) + 1;
	    var sndname = "fm" + snd;
	    console.log("playing: " + sndname);
	    play_sound(sndname);
	}

	var food_on_nose;
	var food_on_nose_sprite;
	var next_food;

	function init_food_on_nose() {
	    food_on_nose = random_food();
	    food_on_nose_sprite = null;
	    next_food = random_food();

	    make_food_on_nose_sprite();
	}


	function make_food_on_nose_sprite() {
	    x = 385;
	    y = game.world.height - 90;
	    if (food_on_nose == '') {
		console.log("mfons: food_on_nose is empty!");
		return;
	    }
	    food_on_nose_sprite = game.add.sprite(x, y, food_on_nose);
	    food_on_nose_sprite.toString = create_tostring_function();
	    food_on_nose_sprite.scale.setTo(0.5,0.5);
	    game.physics.arcade.enable(food_on_nose_sprite);
	    food_on_nose_sprite.body.setSize(foodbounds[food_on_nose].w, foodbounds[food_on_nose].h, 10, 10);
	    food_on_nose_sprite.angle = player_sprite.angle;
	    //food_on_nose_sprite.anchor.setTo(0.5, 1.0);
	    food_on_nose_sprite.anchor.setTo(0.5, 0.5);
	    food_on_nose_sprite.body.collideWorldBounds = true;
	    food_on_nose_sprite.body.bounce.set(0.9);
	}

	function inc_fons_angle(angle) {
	    if (food_on_nose_sprite != null) {
		food_on_nose_sprite.angle += angle;
	    }
	    targetline.angle += angle;
	}

	// place next_food on nose and choose random food for next
	// first check if food_on_nose is empty though
	function get_next_food() {
	    if (food_on_nose != '') {
		console.log("food_on_nose is: " + food_on_nose + ", should be empty!");
		return;
	    }

	    food_on_nose = next_food;
	    console.log("food_on_nose is now: " + food_on_nose);
	    next_food = random_food();
	    console.log("next_food is: " + next_food);

	    make_food_on_nose_sprite();
	}

	function clear_food_on_nose() {
	    food_on_nose = '';
	    //food_on_nose_sprite.destroy();
	    food_on_nose_sprite = null;
	}

	function shot_food_spin() {
	    if (Math.random() < 0.5) {
		return SHOT_FOOD_SPIN;

	    } else {
		return -1 * SHOT_FOOD_SPIN;

	    }
	}

	function shoot_food() {

	    var food_to_shoot = food_on_nose_sprite;
	    if (food_to_shoot == null) {
		get_next_food();
		return;
	    }

	    if (shooting) {
		console.log("already shooting!");
		return;
	    }

	    play_sound("shoot");

	    // sprite angles and velocity angles are not the same... must subtract 90 from sprite angle????
	    velocity_angle = food_to_shoot.angle - 90;
	    //food_to_shoot.anchor.setTo(0.5,0.5);
	    game.physics.arcade.velocityFromAngle(velocity_angle, shoot_velocity, food_to_shoot.body.velocity);
	    console.log("vel is: " + food_to_shoot.body.velocity);
	    food_to_shoot.body.angularVelocity = shot_food_spin();
	    currently_shot_food = food_to_shoot; // set the global variable that is checked for overlap in the update() function


	    console.log(food_to_shoot);
	    console.log("shooting: " + food_to_shoot);
	    clear_food_on_nose();
	    shooting = true;
	}

	var sprites_to_destroy = [];
	function destroy_pending_sprites() {
	    for (var i = 0; i < sprites_to_destroy.length; i++) {
		sprites_to_destroy[i].destroy();
	    }
	    sprites_to_destroy = [];
	}

	    /*
	    if (!(sprite.getBounds().contains(x, y))) {
		// Do something
	    }
	    */

	var rotate_left_button;
	var rotate_left_button;

	function is_pointer_down_in_sprite(sprite) {
	    if (game.input.pointer1.isDown) {
		var x = game.input.pointer1.x;
		var y = game.input.pointer1.y;
		console.log("touch x and y is: " + x + "," + y);
		return (sprite.getBounds().contains(x,y));
	    }

	    if (game.input.activePointer.leftButton.isDown) {
		var x = game.input.mousePointer.x;
		var y = game.input.mousePointer.y;
		console.log("mouse x and y is: " + x + "," + y);
		return (sprite.getBounds().contains(x,y));
	    }

	    return false;
	}

	function is_rotate_left_button_down() {
	    return is_pointer_down_in_sprite(rotate_left_button);
	}

	function is_rotate_right_button_down() {
	    return is_pointer_down_in_sprite(rotate_right_button);
	}

	function is_shoot_button_down() {
	    return is_pointer_down_in_sprite(player_sprite);
	}

	var actionDelayCount = 0;
	var adjustDelayCount = 0;

	function update() {
	    //  Collide the player and the stars with the platforms
	    //var hitPlatform = game.physics.arcade.collide(player, platforms);
	    // TODO: move this to create()
	    cursors = game.input.keyboard.createCursorKeys();

	    destroy_pending_sprites();


	    //  Reset the players velocity (movement)
	    player.body.velocity.x = 0;

	    var doAction = (actionDelayCount++ % ACTION_DELAY) == 0;

	    if (doAction) {

		if (cursors.left.isDown || is_rotate_left_button_down())
		{
		    //  Move to the left
		    //player.body.velocity.x = -150;
		    if (player.angle <= -80) {
			console.log("ow!");
			return;
		    }
		    player.angle -= 1;
		    inc_fons_angle(-1);
		    if (adjustDelayCount++ % ADJUST_DELAY == 0) {
			play_sound("adjust");
		    }
		    //console.log(player.angle);

		}
		else if (cursors.right.isDown || is_rotate_right_button_down())
		{
		    //  Move to the right
		    //player.body.velocity.x = 150;
		    if (player.angle >= 80) {
			console.log("ow!");
			return;
		    }
		    player.angle += 1;
		    inc_fons_angle(1);
		    if (adjustDelayCount++ % ADJUST_DELAY == 0) {
			play_sound("adjust");
		    }
		    //console.log(player.angle);

		}
		else if (this.spaceKey.isDown || is_shoot_button_down()) {
		    shoot_food();
		}
		else
		{
		    //  Stand still
		    player.animations.stop();

		}
	    }

	    game.physics.arcade.overlap(currently_shot_food, foodobj.food, collideFood, null, this);

	    do_food_wiggle(foodobj.food);

	    if (shooting) {
		if (currently_shot_food.body.blocked.up || currently_shot_food.body.blocked.down
		    || currently_shot_food.body.blocked.left || currently_shot_food.body.blocked.right) {
		    play_sound("wallbounce");
		    // when it bounces the rotation reverses! and also spins a bit faster
		    currently_shot_food.body.angularVelocity = Math.floor(-1.3 * currently_shot_food.body.angularVelocity);
		}
	    }
	}

	var wiggle_chance = 0.5;
	var wiggle_delay = 200;
	var wct = 0;
	function do_food_wiggle(sprites) {
	    // you can access the children through playerHitGroup.children[0] and playerHitGroup.children[1] etc.
	    if (wct++ % wiggle_delay != 0) {
		return;
	    }

	    if (wct > 50000000) wct = 0;

	    play_random_food_move_sound();

	    var spritearray = sprites.children;
	    var numsprites = sprites.children.length;
	    for (var ct=0; ct < numsprites; ct++) {
		// should maybe rename this funciton:
		if (food_present_p(wiggle_chance)) {
		    wiggle_sprite(spritearray[ct]);
		}
	    }

	    // make the delay a little random
	    var delay_delta = Math.floor(Math.random() * 50);
	    if (food_present_p(0.5)) {
		delay_delta = -1 * delay_delta;
	    }
	    wiggle_delay += delay_delta;
	}

	function wiggle_sprite(sprite) {
	    //console.log("wiggling: " + sprite);
	    var angle_delta = Math.floor(Math.random() * 10);
	    if (food_present_p(0.5)) {
		angle_delta = -1 * angle_delta;
	    }
	    sprite.angle += angle_delta;
	}

	function scoring_set_check(item) {
	    // keys of hhfoodset are the toString ids of the items in the set
	    // hhfoodset[key] is the item itself
	    keys = Object.keys(item.hhfoodset);
	    if (keys.length >= SCORING_SIZE) {
		console.log("scoring with a set of " + item.key + " of size " + keys.length);
		for (var i = 0; i < keys.length; i++) {
		    var todestroy = item.hhfoodset[keys[i]];
		    foodobj.food.remove(todestroy);
		    sprites_to_destroy.push(todestroy);
		    // cannot do directly because phaser.io will try to do collision detection
		    // iterate over the sprites_to_destroy array in update() function
		    //todestroy.destroy();
		    // and basically get a null pointer exception.
		}
		//game.sound.stopAll();
		play_sound("eat");
	    }
	}

	function collideFood(shotfood, gridfood) {
	    currently_shot_food = null;

	    play_sound('foodland');

	    shooting = false;
	    shotfood.anchor.setTo(0.5, 0.5);
	    shotfood.body.velocity = 0;
	    //shotfood.body.angularVelocity = 1000;
	    shotfood.body.angularVelocity = 0;
	    //shotfood.angle = 0;

	    if (shotfood.key == gridfood.key) {
		// add to set if it matches
		add_to_food_set(gridfood, shotfood);
	    } else {
		// otherwise create another set
		create_set_for_item(shotfood);
	    }

	    // add to food sprite group
	    foodobj.food.add(shotfood);

	    // check if the shotfood now belongs to a set that is large enough to "score" with by elimenating
	    scoring_set_check(shotfood);
	}

    },

};
