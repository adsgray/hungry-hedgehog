
// http://stackoverflow.com/questions/10892322/javascript-hashtable-use-object-key
// http://stackoverflow.com/questions/194846/is-there-any-kind-of-hash-code-function-in-javascript

// http://www.html5gamedevs.com/topic/4227-decrease-collision-box-size/

Hungry = {

    'startgame': function () {

	var shooting = false;
	var hash_id = 0;
	const SCORING_SIZE = 3;
	const SHOT_FOOD_SPIN = 350; // angular velocity of shot food

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
		    var lmargin = 125;
		    var width = 50;
		    var height = 45;
		    // size of grid is 9x7
		    console.log("A");
		    food.removeAll(true);
		    foodgrid = null;

		    var foodarray = [];
		    var rows = 5;
		    var columns = 7;

		    for (var j = 0; j <= rows; j++) {

			for (var i = 0; i <= columns; i++)
			{
			    console.log("in loop");
			    //  Create a star inside of the 'stars' group
			    if (!food_present_p(food_present_chance)) {
				foodarray.push(null);
				continue;
			    }
			    var food_type = random_food();
			    var f = food.create(lmargin + i * width, j * height, food_type);
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

	    game.load.image('beetle', 'assets/beetlesmall.png');
	    game.load.image('slug', 'assets/slugsmall.png');
	    game.load.image('worm', 'assets/wormsmall.png');
	    game.load.image('frog', 'assets/frogsmall.png');
	    game.load.image('earwig', 'assets/earwigsmall.png');

	    game.load.audio('wallbounce', 'assets/wallbouncesound.mp3');
	}

	function create() {
	    //game.add.sprite(0, 0, 'star');
	    //  We're going to be using physics, so enable the Arcade Physics system
	    game.physics.startSystem(Phaser.Physics.ARCADE);

	    //  A simple background for our game
	    game.add.sprite(0, 0, 'sky');

	    // The player and its settings
	    player = game.add.sprite(375, game.world.height - 150, 'hedgehog');
	    // ugh global variable
	    player_sprite = player;
	    player.anchor.setTo(0.5, 0.5);

	    //targetline = game.add.sprite(375, game.world.height, "targetline");
	    targetline = game.add.sprite(350, 500, "targetline");
	    targetline.alpha = 0.25;
	    targetline.anchor.setTo(0.0,1.0);

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
	}

	function play_sound(snd) {
	    var sound = sounds[snd];
	    sound.play();
	}

	var food_on_nose;
	var food_on_nose_sprite;
	var next_food;
	var can_shoot;

	function init_food_on_nose() {
	    food_on_nose = random_food();
	    food_on_nose_sprite = null;
	    next_food = random_food();
	    can_shoot = true;

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

	function shoot_food() {
	    var food_to_shoot = food_on_nose_sprite;
	    if (food_to_shoot == null) {
		get_next_food();
		return;
	    }

	    if (!can_shoot) {
		return;
	    }

	    // sprite angles and velocity angles are not the same... must subtract 90 from sprite angle????
	    velocity_angle = food_to_shoot.angle - 90;
	    //food_to_shoot.anchor.setTo(0.5,0.5);
	    game.physics.arcade.velocityFromAngle(velocity_angle, shoot_velocity, food_to_shoot.body.velocity);
	    console.log("vel is: " + food_to_shoot.body.velocity);
	    food_to_shoot.body.angularVelocity = SHOT_FOOD_SPIN;
	    currently_shot_food = food_to_shoot; // set the global variable that is checked for overlap in the update() function


	    console.log(food_to_shoot);
	    console.log("shooting: " + food_to_shoot);
	    clear_food_on_nose();
	    can_shoot = false;
	    setTimeout(function() { can_shoot = true; }, 2000);
	    shooting = true;
	}

	var sprites_to_destroy = [];
	function destroy_pending_sprites() {
	    for (var i = 0; i < sprites_to_destroy.length; i++) {
		sprites_to_destroy[i].destroy();
	    }
	    sprites_to_destroy = [];
	}

	function update() {
	    //  Collide the player and the stars with the platforms
	    //var hitPlatform = game.physics.arcade.collide(player, platforms);
	    cursors = game.input.keyboard.createCursorKeys();

	    destroy_pending_sprites();


	    //  Reset the players velocity (movement)
	    player.body.velocity.x = 0;

	    if (cursors.left.isDown)
	    {
		//  Move to the left
		//player.body.velocity.x = -150;
		if (player.angle <= -80) {
		    console.log("ow!");
		    return;
		}
		player.angle -= 1;
		inc_fons_angle(-1);
		//console.log(player.angle);

	    }
	    else if (cursors.right.isDown)
	    {
		//  Move to the right
		//player.body.velocity.x = 150;
		if (player.angle >= 80) {
		    console.log("ow!");
		    return;
		}
		player.angle += 1;
		inc_fons_angle(1);
		//console.log(player.angle);

	    }
	    else if (this.spaceKey.isDown) {
		shoot_food();
	    }
	    else
	    {
		//  Stand still
		player.animations.stop();

	    }

	    //  Allow the player to jump if they are touching the ground.
	    if (cursors.up.isDown && player.body.touching.down) // && hitPlatform)
	    {
		player.body.velocity.y = -350;
	    }


	    game.physics.arcade.overlap(currently_shot_food, foodobj.food, collideFood, null, this);

	    if (shooting) {
		if (currently_shot_food.body.blocked.up || currently_shot_food.body.blocked.down
		    || currently_shot_food.body.blocked.left || currently_shot_food.body.blocked.right) {
		    wall_bounce_sound();
		}
	    }
	}

	function wall_bounce_sound() {
	    console.log("bounce!");
	    play_sound("wallbounce");
	    //this.sndBallBounce.play();
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

	    }
	}

	function collideFood(shotfood, gridfood) {
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
