
Hungry = {

    'startgame': function () {


	var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

	function preload() {
	    game.load.image('sky', 'assets/sky.png');
	    game.load.image('ground', 'assets/platform.png');
	    game.load.image('beetle', 'assets/beetlesmall.png');
	    game.load.image('slug', 'assets/slugsmall.png');
	    game.load.image('worm', 'assets/wormsmall.png');
	    game.load.image('frog', 'assets/frogsmall.png');
	    game.load.image('earwig', 'assets/earwigsmall.png');
	    game.load.image('hedgehog', 'assets/hedgehogsmall.png');
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

	    food = game.add.group();

	    food.enableBody = true;

	    //  Here we'll create 12 of them evenly spaced apart
	    for (var i = 0; i < 12; i++)
	    {
		//  Create a star inside of the 'stars' group
		var beetle = food.create(i * 70, 0, 'earwig');
		beetle.scale.setTo(0.5,0.5);

		//  Let gravity do its thing
		beetle.body.gravity.y = 7;

		//  This just gives each star a slightly random bounce value
		beetle.body.bounce.y = 0.7 + Math.random() * 0.2;
	    }

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
		player.angle += 1;

	    }
	    else if (cursors.right.isDown)
	    {
		//  Move to the right
		//player.body.velocity.x = 150;
		player.angle -= 1;

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

	    game.physics.arcade.overlap(player, food, collectStar, null, this);


	}


	function collectStar (player, star) {

	    // Removes the star from the screen
	    star.kill();

	}

    },

};
