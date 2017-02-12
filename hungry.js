
Hungry = {

    'startgame': function () {


	var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
	var foodobj;
	var food;

	var foods = [
	    'beetle',
	    'slug',
	    'worm',
	    'frog',
	    'earwig',
	];

	function random_food() {
	    var item = foods[Math.floor(Math.random()*foods.length)];
	    return item;
	}

	function init_foods() {

	    food = game.add.group();
	    food.enableBody = true;

	    var foodObj = {
		'random_food': random_food,
		'food': food,

		'food_group': foods, // lol

		'random_food_grid': function() {
		    // size of grid is 9x7
		    console.log("A");
		    food.removeAll(true);

		    //  Here we'll create 12 of them evenly spaced apart
		    for (var i = 0; i < 12; i++)
		    {
			console.log("in loop");
			//  Create a star inside of the 'stars' group
			var f = food.create(i * 70, 0, random_food());
			console.log(f);
			f.scale.setTo(0.5,0.5);

			//  Let gravity do its thing
			f.body.gravity.y = 7;

			//  This just gives each star a slightly random bounce value
			f.body.bounce.y = 0.7 + Math.random() * 0.2;
		    }
	    }
	    }

	    return foodObj;
	}

	function preload() {
	    game.load.image('sky', 'assets/sky.png');
	    game.load.image('ground', 'assets/platform.png');
	    game.load.image('hedgehog', 'assets/hedgehogsmall.png');

	    game.load.image('beetle', 'assets/beetlesmall.png');
	    game.load.image('slug', 'assets/slugsmall.png');
	    game.load.image('worm', 'assets/wormsmall.png');
	    game.load.image('frog', 'assets/frogsmall.png');
	    game.load.image('earwig', 'assets/earwigsmall.png');
	}

	function create() {
	    //game.add.sprite(0, 0, 'star');
	    //  We're going to be using physics, so enable the Arcade Physics system
	    game.physics.startSystem(Phaser.Physics.ARCADE);

	    //  A simple background for our game
	    game.add.sprite(0, 0, 'sky');

	    // The player and its settings
	    player = game.add.sprite(375, game.world.height - 150, 'hedgehog');
	    player.anchor.setTo(0.5, 0.5);

	    //  We need to enable physics on the player
	    game.physics.arcade.enable(player);

	    //  Player physics properties. Give the little guy a slight bounce.
	    player.body.bounce.y = 0.2;
	    player.body.gravity.y = 300;
	    player.body.collideWorldBounds = true;

	    //  Our two animations, walking left and right.
	    //player.animations.add('left', [0, 1, 2, 3], 10, true);
	    //player.animations.add('right', [5, 6, 7, 8], 10, true);
	    foodobj = init_foods();
	    food = foodobj.random_food_grid();

	    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	}

	var food_on_nose = '';
	var next_food = '';

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
	}

	function clear_food_on_nose() {
	    food_on_nose = '';
	}

	function shoot_food() {
	    var food_to_shoot = food_on_nose;
	    console.log("shooting: " + food_to_shoot);
	    clear_food_on_nose();
	    get_next_food();
	}

	function update() {
	    //  Collide the player and the stars with the platforms
	    //var hitPlatform = game.physics.arcade.collide(player, platforms);
	    cursors = game.input.keyboard.createCursorKeys();


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
		console.log(player.angle);

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
		console.log(player.angle);

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


	    //game.physics.arcade.collide(stars, platforms);

	    game.physics.arcade.overlap(player, foodobj.food, collectStar, null, this);


	}


	function collectStar (player, star) {

	    // Removes the star from the screen
	    star.kill();

	}

    },

};
