(function() {
  'use strict';

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
      _gravity = 1.5;




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
  sigma.canvas.edges.goo = function(e, s, t, ctx, settings) {
    var color = e.color,
        p = settings('prefix') || '',
        edgeColor = settings('edgeColor'),
        defaultNodeColor = settings('defaultNodeColor'),
        defaultEdgeColor = settings('defaultEdgeColor'),
        v,
        d,
        p1 = 5 / 6,
        p2 = 1 / 6;

    if (!color)
      switch (edgeColor) {
        case 'source':
          color = s.color || defaultNodeColor;
          break;
        case 'target':
          color = t.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

    d = Math.sqrt(Math.pow(t[p + 'x'] - s[p + 'x'], 2) + Math.pow(t[p + 'y'] - s[p + 'y'], 2));
    v = {
      x: (t[p + 'x'] - s[p + 'x']) / d,
      y: (t[p + 'y'] - s[p + 'y']) / d
    };

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(
      s[p + 'x'] + v.y * s[p + 'size'],
      s[p + 'y'] - v.x * s[p + 'size']
    );
    ctx.bezierCurveTo(
      s[p + 'x'] * p1 + t[p + 'x'] * p2 + v.y * e[p + 'size'],
      s[p + 'y'] * p1 + t[p + 'y'] * p2 - v.x * e[p + 'size'],
      t[p + 'x'] * p1 + s[p + 'x'] * p2 + v.y * e[p + 'size'],
      t[p + 'y'] * p1 + s[p + 'y'] * p2 - v.x * e[p + 'size'],
      t[p + 'x'] + v.y * t[p + 'size'],
      t[p + 'y'] - v.x * t[p + 'size']
    );
    ctx.lineTo(
      t[p + 'x'] - v.y * t[p + 'size'],
      t[p + 'y'] + v.x * t[p + 'size']
    );
    ctx.bezierCurveTo(
      t[p + 'x'] * p1 + s[p + 'x'] * p2 - v.y * e[p + 'size'],
      t[p + 'y'] * p1 + s[p + 'y'] * p2 + v.x * e[p + 'size'],
      s[p + 'x'] * p1 + t[p + 'x'] * p2 - v.y * e[p + 'size'],
      s[p + 'y'] * p1 + t[p + 'y'] * p2 + v.x * e[p + 'size'],
      s[p + 'x'] - v.y * s[p + 'size'],
      s[p + 'y'] + v.x * s[p + 'size']
    );
    ctx.closePath();
    ctx.fill();
  };

  sigma.canvas.nodes.goo = function(node, ctx, settings) {
    var prefix = settings('prefix') || '';

    ctx.fillStyle = node.color || settings('defaultNodeColor');
    ctx.beginPath();
    ctx.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      node[prefix + 'size'],
      0,
      Math.PI * 2,
      true
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      node[prefix + 'size'] * 0.5,
      0,
      Math.PI * 2,
      true
    );
    ctx.closePath();
    ctx.fill();
  };




  /**
   * INITIALIZATION SCRIPT:
   * **********************
   */
  function initialize() {
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
        defaultEdgeColor: '#333',
        defaultNodeColor: '#333',
        edgeColor: 'default'
      }
    });
    _dom = $('#konami-container canvas:last-child');
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
          type: 'goo'
        },
        {
          id: (++_eId) + '',
          source: '1',
          target: '3',
          type: 'goo'
        },
        {
          id: (++_eId) + '',
          source: '2',
          target: '3',
          type: 'goo'
        }
      ]
    });

    bindEvents();
    frame();
  }

  function frame() {
    _s.graph.computePhysics();
    _s.refresh();

    if (_s.graph.nodes().length) {
      var w = _dom.width(),
          h = _dom.height();

      // The "rescale" middleware modifies the position of the nodes, but we
      // need here the camera to deal with this. Here is the code:
      var xMin = Infinity,
          xMax = -Infinity,
          yMin = Infinity,
          yMax = -Infinity,
          margin = 100,
          scale;

      _s.graph.nodes().forEach(function(n) {
        xMin = Math.min(n.x, xMin);
        xMax = Math.max(n.x, xMax);
        yMin = Math.min(n.y, yMin);
        yMax = Math.max(n.y, yMax);
      });

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
        'background-color': _spaceMode ? '#f99' : '#9cf'
      });
    }

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

      x = sigma.utils.getX(e) - _dom.width() / 2;
      y = sigma.utils.getY(e) - _dom.height() / 2;

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
            type: 'goo'
          });
        else
          _s.graph.dropNode(n.id);
      });
    });
    _dom.on('mousemove', function(e) {
      _mouseX = sigma.utils.getX(e);
      _mouseY = sigma.utils.getY(e);
    });
    _dom.on('DOMMouseScroll mousewheel', function(e) {
      _radius *= sigma.utils.getDelta(e.originalEvent) < 0 ? 1 / _wheelRatio : _wheelRatio;
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
      _nId = 0;
      _eId = 0;
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

    $(
      '<div id="konami">' +
        '<div id="konami-container">' +
          '<div id="disc"></div>' +
          '<div id="ground"></div>' +
        '</div>' +
        '<div id="close-konami" class="fa fa-times"></div>' +
      '</div>'
    ).appendTo($('.below-the-footer .columns'));
    initialize();
  });
})();
