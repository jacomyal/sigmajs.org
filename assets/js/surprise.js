(function() {
  'use strict';

  var Konami = function (callback) {
    var konami = {
      addEvent: function (obj, type, fn, ref_obj) {
        if (obj.addEventListener)
          obj.addEventListener(type, fn, false);
        else if (obj.attachEvent) {
          // IE
          obj["e" + type + fn] = fn;
          obj[type + fn] = function () {
            obj["e" + type + fn](window.event, ref_obj);
          }
          obj.attachEvent("on" + type, obj[type + fn]);
        }
      },
      input: "",
      pattern: "38384040373937396665",
      load: function (link) {
        this.addEvent(document, "keydown", function (e, ref_obj) {
          if (ref_obj) konami = ref_obj; // IE
          konami.input += e ? e.keyCode : event.keyCode;
          if (konami.input.length > konami.pattern.length)
            konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
          if (konami.input == konami.pattern) {
            konami.code(link);
            konami.input = "";
            e.preventDefault();
            return false;
          }
        }, this);
      },
      code: function (link) {
        window.location = link
      }
    };

    typeof callback === "string" && konami.load(callback);
    if (typeof callback === "function") {
      konami.code = callback;
      konami.load();
    }

    return konami;
  };

  var _s,
      _c,
      _dom,
      _disc,
      _ground,
      _frame,
      _nId = 0,
      _eId = 0,
      _radius = 50,

      _mouseX,
      _mouseY,
      _spaceMode = false,
      _wheelRatio = 1.1,

      _nodeRadius = 10,
      _inertia = 0.8,
      _springForce = 0.01,
      _springLength = 50,
      _maxDisplacement = 15,
      _gravity = 1;




  /**
   * CUSTOM PHYSICS LAYOUT:
   * **********************
   */
  sigma.classes.graph.addMethod('computePhysics', function() {
    var i,
        j,
        l = this.nodesArray.length,

        s,
        t,
        dX,
        dY,
        d,
        v;

    for (i = 0; i < l; i++) {
      s = this.nodesArray[i];
      s.dX *= _inertia;
      s.dY *= _inertia;
    }

    for (i = 0; i < l; i++) {
      s = this.nodesArray[i];
      s.dY += _gravity;

      for (j = i + 1; j < l; j++) {
        t = this.nodesArray[j];

        dX = s.x - t.x;
        dY = s.y - t.y;
        d = Math.sqrt(dX * dX + dY * dY);
        v = ((d < 2 * _nodeRadius) ? (2 * _nodeRadius - d) / d / 2 : 0) -
          ((this.allNeighborsIndex[s.id] || {})[t.id] ? _springForce * (d - _springLength) : 0);

        t.dX -= v * dX;
        t.dY -= v * dY;
        s.dX += v * dX;
        s.dY += v * dY;
      }
    }

    for (i = 0; i < l; i++) {
      s = this.nodesArray[i];
      s.dX = Math.max(Math.min(s.dX, _maxDisplacement), -_maxDisplacement);
      s.dY = Math.max(Math.min(s.dY, _maxDisplacement), -_maxDisplacement);
      s.x += s.dX;
      s.y += s.dY;

      // Collision with the _ground:
      s.y = Math.min(-_nodeRadius, s.y);
    }
  });




  /**
   * CUSTOM RENDERERS:
   * *****************
   */
  sigma.canvas.nodes.goo = function(node, ctx, settings) {
    var prefix = settings('prefix') || '',
        size = node[prefix + 'size'];

    ctx.fillStyle = node.color || settings('defaultNodeColor');
    ctx.beginPath();
    ctx.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      size,
      0,
      Math.PI * 2,
      true
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(
      node[prefix + 'x'] - size / 2,
      node[prefix + 'y']
    );
    ctx.lineTo(
      node[prefix + 'x'] + size / 2,
      node[prefix + 'y']
    );
    ctx.moveTo(
      node[prefix + 'x'],
      node[prefix + 'y'] - size / 2
    );
    ctx.lineTo(
      node[prefix + 'x'],
      node[prefix + 'y'] + size / 2
    );
    ctx.stroke();
  };




  /**
   * INITIALIZATION SCRIPT:
   * **********************
   */
  function initialize() {
    _nId = 0;
    _eId = 0;

    _s = new sigma({
      renderer: {
        container: document.getElementById('konami-container'),
        type: 'canvas'
      },
      settings: {
        autoRescale: false,
        mouseEnabled: false,
        touchEnabled: false,
        nodesPowRatio: 1,
        edgesPowRatio: 1,
        minEdgeSize: 4,
        maxEdgeSize: 5,
        defaultEdgeColor: '#bd413a',
        defaultNodeColor: '#fae3b4',
        edgeColor: 'default'
      }
    });
    _dom = $('#konami-container canvas.sigma-mouse');
    _disc = $('#disc');
    _ground = $('#ground');
    _c = _s.cameras[0];

    // Initialize graph:
    _s.graph.read({
      nodes: [
        {
          id: (++_nId) + '',
          size: _nodeRadius,
          x: 0,
          y: -80,
          dX: 0,
          dY: 0,
          type: 'goo'
        },
        {
          id: (++_nId) + '',
          size: _nodeRadius,
          x: 10,
          y: -100,
          dX: 0,
          dY: 0,
          type: 'goo'
        },
        {
          id: (++_nId) + '',
          size: _nodeRadius,
          x: 20,
          y: -80,
          dX: 0,
          dY: 0,
          type: 'goo'
        }
      ],
      edges: [
        {
          id: (++_eId) + '',
          source: '1',
          target: '2',
          size: 2
        },
        {
          id: (++_eId) + '',
          source: '1',
          target: '3',
          size: 2
        },
        {
          id: (++_eId) + '',
          source: '2',
          target: '3',
          size: 2
        }
      ]
    });

    bindEvents();
    frame();
  }

  function frame() {
    _s.graph.computePhysics();
    _s.refresh();

    var a,
        w = _dom.width(),
        h = _dom.height();

    // The "rescale" middleware modifies the position of the nodes, but we
    // need here the camera to deal with this. Here is the code:
    var xMin = Infinity,
        xMax = -Infinity,
        yMin = Infinity,
        yMax = -Infinity,
        margin = 100,
        scale;

    if ((a = _s.graph.nodes()).length)
      a.forEach(function(n) {
        xMin = Math.min(n.x, xMin);
        xMax = Math.max(n.x, xMax);
        yMin = Math.min(n.y, yMin);
        yMax = Math.max(n.y, yMax);
      });
    else {
      xMin = 0;
      xMax = 0;
      yMin = 0;
      yMax = 0;
    }

    xMax += margin;
    xMin -= margin;
    yMax += margin;
    yMin -= margin;

    scale = Math.min(
      w / Math.max(xMax - xMin, 1),
      h / Math.max(yMax - yMin, 1)
    );

    _c.goTo({
      x: (xMin + xMax) / 2,
      y: (yMin + yMax) / 2,
      ratio: 1 / scale
    });

    _ground.css('top', Math.max(h / 2 - Math.min((yMin + yMax) / 2 * scale, h), 0));

    _disc.css({
      width: 2 * _radius * scale,
      height: 2 * _radius * scale,
      top: _mouseY - _radius * scale,
      left: _mouseX - _radius * scale,
      'border-radius': _radius * scale,
      'background-color': _spaceMode ? '#a22d27' : '#aac789'
    });

    _frame = requestAnimationFrame(frame);
  }




  /**
   * EVENTS BINDING:
   * ***************
   */
  function bindEvents() {
    _dom.on('click', function(e) {
      // Find neighbors:
      var x,
          y,
          p,
          id,
          neighbors;

      x = sigma.utils.getX(e.originalEvent) - _dom.width() / 2;
      y = sigma.utils.getY(e.originalEvent) - _dom.height() / 2;

      p = _c.cameraPosition(x, y);
      x = p.x;
      y = p.y;

      neighbors = _s.graph.nodes().filter(function(n) {
        return (Math.sqrt(
          Math.pow(n.x - x, 2) +
          Math.pow(n.y - y, 2)
        ) - n.size) < _radius;
      });

      if (!_spaceMode)
        _s.graph.addNode({
          id: (id = (++_nId) + ''),
          size: _nodeRadius,
          x: x + Math.random() / 10,
          y: y + Math.random() / 10,
          dX: 0,
          dY: 0,
          type: 'goo'
        });

      neighbors.forEach(function(n) {
        if (!_spaceMode)
          _s.graph.addEdge({
            id: (++_eId) + '',
            source: id,
            target: n.id,
            size: 2
          });
        else
          _s.graph.dropNode(n.id);
      });
    });
    _dom.on('mousemove', function(e) {
      _mouseX = sigma.utils.getX(e.originalEvent);
      _mouseY = sigma.utils.getY(e.originalEvent);
    });
    _dom.on('DOMMouseScroll mousewheel', function(e) {
      _radius *= sigma.utils.getDelta(e.originalEvent) < 0 ? 1 / _wheelRatio : _wheelRatio;
      e.preventDefault();
    });
    $(document).on('keydown', function(e) {
      _spaceMode = (e.which == 32) ? true : _spaceMode;
    });
    $(document).on('keyup', function(e) {
      _spaceMode = e.which == 32 ? false : _spaceMode;
    });
    $('#close-konami').on('click', function() {
      window.cancelAnimationFrame(_frame);
      _s.kill();
      _s = null;
      $('#konami').remove();
    });
  }




  /**
   * INITIALIZATION:
   * ***************
   */
  var konami = new Konami(function() {
    if (_s)
      return;

    var isInitialized = false;
    $(
      '<div id="konami">' +
        '<div id="konami-container">' +
          '<div id="disc"></div>' +
          '<div id="ground"></div>' +
        '</div>' +
        '<ul class="caption">' +
          '<li><strong>CLICK</strong>: Add a node, linked to nodes in the mouse area</li>' +
          '<li><strong>SPACEBAR + CLICK</strong>: Remove all nodes in the mouse area</li>' +
          '<li><strong>MOUSEWHEEL</strong>: Change the size of the mouse area</li>' +
        '</ul>' +
        '<div id="close-konami" class="fa fa-times"></div>' +
      '</div>'
    ).css({
      height: 0,
      color: '#fff'
    }).prependTo($('.below-the-footer .columns')).animate({
      height: 300
    }, {
      duration: 400,
      complete: function() {
        $('html, body').animate({
          scrollTop: $('#konami').offset().top
        }, {
          complete: function() {
            if (!isInitialized) {
              initialize();
              isInitialized = true;
            }
          }
        });
      }
    });
  });
})();
