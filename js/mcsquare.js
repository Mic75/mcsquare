var MCS = function(){
  var scene = null,
      camera = null,
      renderer = null,
      assembled_bracket = null,
      objects_group = null,
      mouse_page_x = null,
      mouse_page_y = null,
      x_rotation_factor = 0.05,
      y_rotation_factor = 0.03,
      x_rotation_targeted = null,
      y_rotation_targeted = null,
      is_user_interacting = false,
      tween_factor = 0.1,
      z_translation = 0,
      PI2 = 2 * Math.PI,
      QUARTER_PI = Math.PI / 4,
      HALF_PI = Math.PI / 2,
      animated = true,
      initial_y_angular_speed = THREE.Math.degToRad( 900 ) / 30,
      y_angular_speed = initial_y_angular_speed,
      absolute_rotation_value = 0,
      y_rotation_constraint = THREE.Math.degToRad( -750 ),
      lastTime = 0,
      view_size = 35,
      mcs_obj_loading_manager = new THREE.LoadingManager(),
      mcs_tex_loading_manager = new THREE.LoadingManager(),
      objects_loaded = false,
      textures_loaded = false,
      mcs_3d_objects = {
      bracket: {
        load: function( bracket ){
          var original_geometry = bracket.children[0].geometry,
              original_material = new THREE.MeshLambertMaterial(),
              bounding_box = null,
              original_position = new THREE.Vector3( 0, 0, 0 ),
              clone1 = new THREE.Mesh( original_geometry, original_material ),
              clone2 = new THREE.Mesh( original_geometry, original_material ),
              clone3 = new THREE.Mesh( original_geometry, original_material ),
              clone4 = new THREE.Mesh( original_geometry, original_material );
          
          load_texture( "assets/textures/BracketTexture.jpg", original_material );
          assembled_bracket = new THREE.Object3D();

          original_geometry.computeBoundingBox();
          original_geometry.computeVertexNormals();
          bounding_box = original_geometry.boundingBox;

          clone1.position.copy( new THREE.Vector3( ( bounding_box.max.x - bounding_box.min.x - 0.1 ) / 2, ( bounding_box.max.y - bounding_box.min.y - 0.1 ) / 2, 0 ) );
          assembled_bracket.add( clone1 );

          clone2.position.copy( new THREE.Vector3( -( bounding_box.max.x - bounding_box.min.x - 0.1 ) / 2, ( bounding_box.max.y - bounding_box.min.y - 0.1 ) / 2, 0 ) );
          clone2.rotation.z += HALF_PI;
          assembled_bracket.add( clone2 );

          clone3.position.copy( new THREE.Vector3( ( bounding_box.max.x - bounding_box.min.x - 0.1 ) / 2, -( bounding_box.max.y - bounding_box.min.y - 0.1 ) / 2, 0 ) );
          clone3.rotation.z -= HALF_PI;
          assembled_bracket.add( clone3 );

          clone4.position.copy( new THREE.Vector3( -( bounding_box.max.x - bounding_box.min.x - 0.1 ) / 2, -( bounding_box.max.y - bounding_box.min.y - 0.1 ) / 2, 0 ) );
          clone4.rotation.z -= Math.PI;
          assembled_bracket.add( clone4 );
          mcs_3d_objects.bracket.object_3d = assembled_bracket;

          assembled_bracket.position.copy( original_position );
          assembled_bracket.original_position = original_position;
          assembled_bracket.translation_coeff = -0.3;
          assembled_bracket.name = "bracket";
          objects_group.add( assembled_bracket );
        },
        update: function(){
        }
      },
      eraser: {
        load: function( eraser ){
          var original_position = new THREE.Vector3( -7, 0, 1.5 );
          mcs_3d_objects.eraser.object_3d = eraser;
          eraser.rotation.y = Math.PI;
          eraser.children[0].geometry.computeFaceNormals();
          eraser.children[0].geometry.computeVertexNormals();
          eraser.children[0].material = new THREE.MeshLambertMaterial();
          load_texture("assets/textures/eraser_texture.jpg", eraser.children[0].material );
          eraser.position.copy( original_position );
          eraser.original_position = original_position;
          eraser.name = "eraser";
          eraser.translation_coeff = 0;
          objects_group.add( eraser );
        },
        update: function(){
        }
      },
      frame: {
        load: function( frame ){
          var original_position = new THREE.Vector3( 0, 0, 1 );
          mcs_3d_objects.frame.object_3d = frame;
          frame.children[0].geometry.computeFaceNormals();
          frame.children[0].geometry.computeVertexNormals();
          frame.children[0].material = new THREE.MeshLambertMaterial();
          load_texture( "assets/textures/FrameTexture.jpg", frame.children[0].material );
          frame.position.copy( original_position );
          frame.original_position = original_position;
          frame.name = "frame";
          frame.translation_coeff = 0;
          objects_group.add( frame );
        },
        update: function(){
        }
      },
      paper: {
        objects_3d: { },
        load: function( paper ){
          var paper_mesh = paper.children[0], scope = mcs_3d_objects.paper,
                  paper_names = [ "alphabet", "calendar", "grid", "soccer", "bubble" ], paper_name = null,
                  first_paper_z_position = 2.5,
                  translation_coeff = 0.3,
                  original_position = null;

          paper_mesh.geometry.computeVertexNormals();
          paper_mesh.material = new THREE.MeshLambertMaterial();

          for ( var i = 0, len = paper_names.length; i < len; i++ ){
            paper_name = paper_names[i];
            scope.objects_3d[ paper_name ] = new THREE.Mesh( paper_mesh.geometry, paper_mesh.material.clone() );
            load_texture("assets/textures/paper_" + paper_name + ".jpg", scope.objects_3d[ paper_name ].material );
            original_position = new THREE.Vector3( 0, 0, first_paper_z_position );
            scope.objects_3d[ paper_name ].position.copy( original_position );
            scope.objects_3d[ paper_name ].original_position = original_position;
            scope.objects_3d[ paper_name ].translation_coeff = translation_coeff;
            scope.objects_3d[ paper_name ].name = "paper_" + paper_name;
            objects_group.add( scope.objects_3d[ paper_name ] );
            first_paper_z_position += 0.2;
            translation_coeff += 0.2;
          }
        },
        update: function(){
        }
      },
      pen: {
        load: function( pen ){
          var original_position = new THREE.Vector3( -10, 0, 0.5 );
          mcs_3d_objects.pen.object_3d = pen;
          pen.children[0].material = new THREE.MeshPhongMaterial();
          pen.children[0].geometry.computeVertexNormals();
          load_texture( "assets/textures/penTexture.jpg", pen.children[0].material );
          pen.position.copy( original_position );
          pen.original_position = original_position;
          pen.name = "pen";
          pen.translation_coeff = 0;
          objects_group.add( pen );
        },
        update: function(){
        }
      },
      upper_acrylic: {
        load: function( upper_acrylic ){
          var original_position = new THREE.Vector3( 0, 0, 2.5 ),
              path = "assets/textures/",
              urls = [
                path + 'px.jpg', path + 'nx.jpg',
                path + 'py.jpg', path + 'ny.jpg',
                path + 'pz.jpg', path + 'nz.jpg'
              ],
              reflectionCube = load_texture_cube( urls );//THREE.ImageUtils.loadTextureCube( urls );
          
          reflectionCube.format = THREE.RGBFormat;
          mcs_3d_objects.upper_acrylic.object_3d = upper_acrylic;
          upper_acrylic.children[0].geometry.computeVertexNormals();
          upper_acrylic.children[0].material = new THREE.MeshPhongMaterial( {
            transparent: true,
            map: THREE.ImageUtils.loadTexture( "assets/textures/Upper_AcrylicPartTexture.png" ),
            envMap: reflectionCube,
            color: 0xffffff
          } );
          upper_acrylic.position.copy( original_position );
          upper_acrylic.original_position = original_position;
          upper_acrylic.name = "upper_acrylic";
          upper_acrylic.translation_coeff = 1.5;
          objects_group.add( upper_acrylic );
        },
        update: function(){

        }
      }
    };

  function load_texture_cube ( array, mapping, onLoad, onError ) {

		var images = [],
		    loader = new THREE.ImageLoader( mcs_tex_loading_manager ),
        loaded = 0,
        texture = new THREE.CubeTexture( images, mapping );
		
    loader.crossOrigin = this.crossOrigin;
		texture.flipY = false;

		var loadTexture = function ( i ) {

			loader.load( array[ i ], function ( image ) {
				texture.images[ i ] = image;
				loaded += 1;
				if ( loaded === 6 ) {
					texture.needsUpdate = true;
					if ( onLoad ) onLoad( texture );
				}
			}, undefined, onError );
		};

		for ( var i = 0, il = array.length; i < il; ++ i ) {
			loadTexture( i );
		}
		return texture;
	}
  
  function load_texture(url, material){
    var texture_loader = new THREE.TextureLoader( mcs_tex_loading_manager );
    texture_loader.load(
            url,
            function( texture ){
              material.map = texture;
              material.needsUpdate = true;
            }
    );
  }

  function append_loading_image( $container ){
    var image = new Image(window.innerWidth - 40, window.innerHeight - 40);
    image.src = "assets/textures/loading.jpg";
    $container.append( image );
  }
  
  function get_webgl_viewport( options ){
    var webgl_canvas = document.createElement( "canvas" );

    options = options || { };
    webgl_canvas.id = "mcs-viewport";
    return webgl_canvas;
  }

  function append_placeholder_image( $container ){
    var placeholder_image = document.createElement( "img" );

    placeholder_image.id = "mcs-placeholder";
    $container.append( placeholder_image );
  }

  function is_webgl_enabled(){
    var canvas = document.createElement( 'canvas' ),
            rendering_context = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );

    return typeof rendering_context !== "undefined";
  }

  function setup_light( scene )
  {
    var directional_light = new THREE.DirectionalLight( 0xffffff, 0.8 );
    directional_light.position.set( 1, 1, 1 );
    scene.add( directional_light );
  }

  function init_scene( canvas ){
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera();
    scene.add( new THREE.AmbientLight( 0xaaaaaa ) );
    setup_light( scene );
    return scene;
  }

  function setup_camera( camera, canvas )
  {
    var aspect_ratio = canvas.width / canvas.height;

    camera.left = -aspect_ratio * view_size / 2;
    camera.right = aspect_ratio * view_size / 2;
    camera.top = view_size / 2;
    camera.bottom = -view_size / 2;
    camera.near = 0.1;
    camera.far = 100;
    camera.position.z = 50;
    camera.updateProjectionMatrix();
  }

  function add_mcs_objects_to_scene(){
    var obj_loader = new THREE.OBJLoader( mcs_obj_loading_manager );

    objects_group = new THREE.Object3D();
    for ( var object_name in mcs_3d_objects ){
      if ( mcs_3d_objects.hasOwnProperty( object_name ) && mcs_3d_objects[object_name].load !== undefined ){
        obj_loader.load( "assets/obj/" + object_name + ".obj", mcs_3d_objects[object_name].load, undefined, function(){
          console.log( "Connection error, check the server status" );
        } );
      }
    }
    scene.add( objects_group );
    x_rotation_targeted = objects_group.rotation.x;
    y_rotation_targeted = objects_group.rotation.y;
  }

  function interpolate( x, ya, yb, xa, xb ){
    return ( ya + ( ( x - xa ) * ( yb - ya ) ) / ( xb - xa ) );
  }

  function set_object_z_position( object3d, z_translation ){

    var new_z = object3d.original_position.z + z_translation * object3d.translation_coeff;
    object3d.position.setZ( new_z );
  }

  function update_objects_z_translation( y_rotation ){
    var max_z_translation = 30;
    y_rotation = y_rotation % PI2;
    y_rotation = y_rotation < 0 ? y_rotation + PI2 : y_rotation;

    if ( y_rotation > QUARTER_PI && y_rotation <= Math.PI ){
      z_translation = interpolate( y_rotation, 0, max_z_translation, QUARTER_PI, Math.PI );
    }
    else if ( y_rotation > Math.PI && y_rotation < 7 * QUARTER_PI ){
      z_translation = interpolate( y_rotation, max_z_translation, 0, Math.PI, 7 * QUARTER_PI );
    }
    else{
      z_translation = 0;
    }
  }

  function tween_rotation_around_y(){
    objects_group.rotation.y = objects_group.rotation.y + ( y_rotation_targeted - objects_group.rotation.y ) * tween_factor;
    update_objects_z_translation( objects_group.rotation.y );
    for ( var i = 0, len = objects_group.children.length; i < len; i++ ){
      set_object_z_position( objects_group.children[ i ], z_translation );
    }
  }

  function tween_rotation_around_x(){
    var x_rotation_constraint = QUARTER_PI,
            next_x_rotation_value = objects_group.rotation.x + ( x_rotation_targeted - objects_group.rotation.x ) * tween_factor;

    if ( next_x_rotation_value > -x_rotation_constraint && next_x_rotation_value < x_rotation_constraint ){
      objects_group.rotation.x = next_x_rotation_value;
    }
  }

  function animate_mcs_with_rotation_y(){
    y_angular_speed = interpolate( absolute_rotation_value, initial_y_angular_speed, 0.003, 0, y_rotation_constraint );
    absolute_rotation_value -= y_angular_speed;
    objects_group.rotation.y = absolute_rotation_value % PI2;
  }

  function animate_mcs_z_position(){
    update_objects_z_translation( objects_group.rotation.y );
    for ( var i = 0, len = objects_group.children.length; i < len; i++ ){
      set_object_z_position( objects_group.children[ i ], z_translation );
    }
  }

  function stop_mcs_animation(){
    animated = false;
    y_rotation_targeted = objects_group.rotation.y;
  }

  function animate_mcs(){
    if ( Date.now() - lastTime >= 33 ){
      animate_mcs_with_rotation_y();
      animate_mcs_z_position();
      if ( absolute_rotation_value < y_rotation_constraint ){
        stop_mcs_animation();
      }
      lastTime = Date.now();
    }
  }

  function update_objects(){
    if ( animated === true ){
      animate_mcs();
    }
    else{
      tween_rotation_around_y();
      tween_rotation_around_x();
    }
  }

  function render(){
    requestAnimationFrame( render );
    update_objects();
    renderer.render( scene, camera );
  }

  function on_mouse_move( event ){

    var delta_y_rotation = null,
            delta_x_rotation = null;

    if ( is_user_interacting === true ){

      delta_y_rotation = ( event.pageX - mouse_page_x ) * y_rotation_factor;
      delta_x_rotation = ( event.pageY - mouse_page_y ) * x_rotation_factor;

      y_rotation_targeted = objects_group.rotation.y + delta_y_rotation;
      x_rotation_targeted = objects_group.rotation.x + delta_x_rotation;
      mouse_page_x = event.pageX;
      mouse_page_y = event.pageY;
    }
  }

  function on_mouse_down( event )
  {
    is_user_interacting = true;
    animated = false;
    mouse_page_x = event.pageX;
    mouse_page_y = event.pageY;

  }

  function disable_interaction()
  {
    is_user_interacting = false;
  }

  function on_window_resize()
  {
    renderer.setSize( window.innerWidth - 40, window.innerHeight - 40 );
    setup_camera( camera, renderer.domElement );
  }

  function bind_dom_event(){
    $( renderer.domElement ).mousemove( on_mouse_move );
    $( renderer.domElement ).mousedown( on_mouse_down );
    $( renderer.domElement ).mouseup( disable_interaction );
    $( renderer.domElement ).mouseout( disable_interaction );
    $( window ).resize( on_window_resize );
  }

  function init_loader_manager(){
    mcs_obj_loading_manager.onLoad = function(){
      objects_loaded = true;
    };
    
    mcs_tex_loading_manager.onLoad = function(){
      textures_loaded = true;
    };
  }

  function start_mcs( canvas, $container ){
    
    function wait_for_loading(){
      if ( objects_loaded === true && textures_loaded === true ){
        $container.children( "img" ).fadeOut({complete: function(){
            $container.children( "img" ).replaceWith( canvas );
            render();
          }
        });
      }
      else{
        setTimeout( wait_for_loading, 100 );
      }
    }
    
    renderer = new THREE.WebGLRenderer( { canvas: canvas, alpha: true } );
    renderer.setClearColor( 0x000000, 0 );
    init_scene( canvas );
    on_window_resize();
    init_loader_manager();
    add_mcs_objects_to_scene();
    bind_dom_event();
    wait_for_loading();
    
  }

  this.create = function( container_id, options ){

    var $container = $( "#" + container_id ),
        canvas = null;
    if ( is_webgl_enabled() ){
      append_loading_image( $container );
      canvas = get_webgl_viewport( options );
      start_mcs( canvas, $container );
    }
    else{
      append_placeholder_image( $container );
    }
  };
};


