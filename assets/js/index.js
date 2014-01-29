$(document).ready(function() {
  hljs.initHighlightingOnLoad();

  var _wrapper = $('#wrapper'),
      _header = $('header'),
      _footer = $('footer'),
      _belowFooter = $('.below-the-footer'),
      _config = {
        headerHeight: 63
      };

  // Dock the header to the top of the window when scrolled past the banner.
  _header.scrollToFixed();

  // Dock the footer to the bottom of the page, but scroll up to reveal more
  $('footer').scrollToFixed({
    bottom: 0,
    limit: function() {
      return _belowFooter.offset().top - _footer.outerHeight();
    }
  });

  // Deal with the menu:
  $('a.local-link[href^="#"]').click(function(e) {
    $('.menu', _header).removeClass('visible');
    $('html, body').animate({
      scrollTop: $($(this).attr('href')).offset().top - _config.headerHeight
    });
    return false;
  });

  $(window).on('scroll', function() {
    if (!$(window).scrollTop())
      _header.removeClass('scrolled');
    else
      _header.addClass('scrolled');

    $('a.local-link[href^="#"]').removeClass('selected').each(function() {
      var dom,
          target = $(this),
          id = target.attr('href');

      // Check that the scroll is not null:
      if (!$(window).scrollTop())
        return false;

      if (
        (dom = $(id)).length &&
        $(window).scrollTop() < dom.position().top - _header.height() - _config.margin + 1
      ) {

        $('a.local-link[href="' + id + '"]').addClass('selected');
        return false;
      }
    });
  });

  $('.menu-button').click(function() {
    $('.menu', _header).toggleClass('visible');
    $(this).closest('.menu-toggler').toggleClass('visible');
  });

  // Sigma showcase in title:
  $.ajax({
    dataType: 'json',
    url: 'assets/data/les-miserables.json',
    success: function(graph) {
      var lines = 15,
          prefix = 'file_';

      // Sort nodes:
      graph.nodes = graph.nodes.sort(function(a, b) {
        return +(b.size - a.size) * 2 - 1;
      });

      // Set views:
      graph.nodes.forEach(function(node, i) {
        node.grid_x = 100 * (i % lines);
        node.grid_y = 100 * Math.floor(i / lines);
        node.grid_color = '#ccc';
        node.x = node.file_x = node.x;
        node.y = node.file_y = node.y;
        node.color = node.file_color = node.color;
      });

      // Initialize sigma:
      var s = new sigma({
        graph: graph,
        renderer: {
          container: document.getElementById('sigma-title'),
          type: 'canvas'
        },
        settings: {
          enableCamera: false,
          enableHovering: false,
          mouseEnabled: false,
          drawLabels: false,
          animationsTime: 500
        }
      });

      function animate(p) {
        if (p !== prefix) {
          prefix = p || (prefix === 'grid_' ? 'file_' : 'grid_');
          sigma.plugins.animate(
            s,
            {
              color: prefix + 'color',
              x: prefix + 'x',
              y: prefix + 'y'
            }
          );
        }
      }

      var isDown = false,
          frameID;

      $('#title').bind('mouseenter', function() {
        animate('grid_');
      }).bind('mouseleave', function() {
        animate('file_');
      }).bind('touchstart', function() {
        isDown = true;
        clearTimeout(frameID);
        frameID = setTimeout(function() {
          isDown = false;
        }, 100);
      }).bind('touchend', function() {
        if (isDown)
          animate();
        isDown = false;
      });
    }
  });

  /**
   * SIGMA FIRST USE CASE:
   */
  new sigma({
    container: $('.box#sigma-first')[0],
    graph: {
      "nodes": [
        {
          "id": "n0",
          "label": "A node",
          "x": 0,
          "y": 0,
          "size": 3
        },
        {
          "id": "n1",
          "label": "Another node",
          "x": 3,
          "y": 1,
          "size": 2
        },
        {
          "id": "n2",
          "label": "And a last one",
          "x": 1,
          "y": 3,
          "size": 1
        }
      ],
      "edges": [
        {
          "id": "e0",
          "source": "n0",
          "target": "n1"
        },
        {
          "id": "e1",
          "source": "n1",
          "target": "n2"
        },
        {
          "id": "e2",
          "source": "n2",
          "target": "n0"
        }
      ]
    },
    settings: {
      defaultNodeColor: '#ec5148',
      sideMargin: 2
    }
  });

  /**
   * SIGMA TUTO - STEP 1
   */
  sigma.parsers.gexf(
    'assets/data/les-miserables.gexf',
    { // Here is the ID of the DOM element that
      // will contain the graph:
      container: 'sigma-tuto-step1'
    },
    function(s) {
      // This function will execute when the graph
      // is displayed, and s is the related sigma
      // instance.
    }
  );

  /**
   * SIGMA TUTO - STEP 2
   */
  // Add a method to the graph model that returns an
  // object with every neighbors of a node inside:
  sigma.classes.graph.addMethod('neighbors', function(nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
      neighbors[k] = this.nodesIndex[k];

    return neighbors;
  });

  sigma.parsers.gexf(
    'assets/data/les-miserables.gexf',
    {
      container: 'sigma-tuto-step2'
    },
    function(s) {
      // We first need to save the original colors of our
      // nodes and edges, like this:
      s.graph.nodes().forEach(function(n) {
        n.originalColor = n.color;
      });
      s.graph.edges().forEach(function(e) {
        e.originalColor = e.color;
      });

      // When a node is clicked, we check for each node
      // if it is a neighbor of the clicked one. If not,
      // we set its color as grey, and else, it takes its
      // original color.
      // We do the same for the edges, and we only keep
      // edges that have both extremities colored.
      s.bind('clickNode', function(e) {
        var nodeId = e.data.node.id,
            toKeep = s.graph.neighbors(nodeId);
        toKeep[nodeId] = e.data.node;

        s.graph.nodes().forEach(function(n) {
          if (toKeep[n.id])
            n.color = n.originalColor;
          else
            n.color = '#eee';
        });

        s.graph.edges().forEach(function(e) {
          if (toKeep[e.source] && toKeep[e.target])
            e.color = e.originalColor;
          else
            e.color = '#eee';
        });

        // Since the data has been modified, we need to
        // call the refresh method to make the colors
        // update effective.
        s.refresh();
      });

      // When the stage is clicked, we just color each
      // node and edge with its original color.
      s.bind('clickStage', function(e) {
        s.graph.nodes().forEach(function(n) {
          n.color = n.originalColor;
        });

        s.graph.edges().forEach(function(e) {
          e.color = e.originalColor;
        });

        // Same as in the previous event:
        s.refresh();
      });
    }
  );
});
