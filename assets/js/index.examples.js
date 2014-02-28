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

});
