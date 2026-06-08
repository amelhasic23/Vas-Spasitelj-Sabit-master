function initSiteScripts(attempt) {
	var retryCount = attempt || 0;
	if (!window.jQuery || !window.jQuery.fn || typeof window.jQuery.fn.owlCarousel !== 'function') {
		if (retryCount < 40) {
			window.setTimeout(function () {
				initSiteScripts(retryCount + 1);
			}, 100);
		}
		return;
	}

	if (document.body && document.body.dataset.siteScriptsInitialized === 'true') {
		return;
	}

	if (document.body) {
		document.body.dataset.siteScriptsInitialized = 'true';
	}

	var $ = window.jQuery;

	function initAOS() {
		if (window.AOS && typeof window.AOS.init === "function") {
			window.AOS.init({ duration: 800, easing: "slide", once: true });
		}
	}

	function cloneSiteMenu() {
		$(".js-clone-nav").each(function () {
			$(this).clone().attr("class", "site-nav-wrap").appendTo(".site-mobile-menu-body");
		});
	}

	function closeOffcanvasMenu() {
		if (!$('body').hasClass('offcanvas-menu')) {
			return;
		}

		$('body').removeClass('offcanvas-menu');
		$('.js-menu-toggle').removeClass('active');
	}

	function onNextFrame(callback) {
		if (typeof window.requestAnimationFrame === 'function') {
			window.requestAnimationFrame(callback);
			return;
		}

		window.setTimeout(callback, 0);
	}

	function initMobileMenu() {
		cloneSiteMenu();

		$('body').on('click', '.js-menu-toggle', function (event) {
			event.preventDefault();
			var isOpen = $('body').hasClass('offcanvas-menu');
			$('body').toggleClass('offcanvas-menu', !isOpen);
			$('.js-menu-toggle').toggleClass('active', !isOpen);
		});

		$(document).on('mouseup', function (event) {
			var container = $('.site-mobile-menu');
			if (!container.is(event.target) && container.has(event.target).length === 0) {
				closeOffcanvasMenu();
			}
		});

		window.addEventListener('resize', function () {
			if (window.innerWidth > 768) {
				closeOffcanvasMenu();
			}
		});
	}

	function applyCarouselA11y($carousel, carouselLabel) {
		var $dots = $carousel.find('.owl-dot');
		var total = $dots.length;
		var dotPrefix = carouselLabel || 'Karusel';

		$carousel.attr('aria-label', dotPrefix);

		$dots.each(function (index) {
			var isActive = this.classList.contains('active');
			this.setAttribute('type', 'button');
			this.setAttribute('aria-label', dotPrefix + ': prikaži slajd ' + (index + 1) + ' od ' + total);
			this.setAttribute('aria-current', isActive ? 'true' : 'false');
			this.setAttribute('title', 'Slajd ' + (index + 1));
		});

		var prevButton = $carousel.find('.owl-prev').get(0);
		if (prevButton) {
			prevButton.setAttribute('type', 'button');
			prevButton.setAttribute('aria-label', dotPrefix + ': prethodni slajd');
		}

		var nextButton = $carousel.find('.owl-next').get(0);
		if (nextButton) {
			nextButton.setAttribute('type', 'button');
			nextButton.setAttribute('aria-label', dotPrefix + ': sljedeći slajd');
		}
	}

	function bindCarouselA11y($carousel, carouselLabel) {
		var refreshA11y = function () {
			onNextFrame(function () {
				applyCarouselA11y($carousel, carouselLabel);
			});
		};

		$carousel.on('initialized.owl.carousel changed.owl.carousel refreshed.owl.carousel translated.owl.carousel', refreshA11y);
		refreshA11y();
	}

	function initCarousels() {
		var $aboutCarousel = $('.about-carousel');
		if ($aboutCarousel.length) {
			bindCarouselA11y($aboutCarousel, 'Galerija o meni');
			$aboutCarousel.owlCarousel({
				items: 1,
				loop: true,
				autoplay: true,
				autoplayTimeout: 4000,
				smartSpeed: 800,
				nav: false,
				dots: true,
				animateIn: 'fadeIn',
				animateOut: 'fadeOut'
			});
		}

		var $multiCarousels = $('.nonloop-block-13');
		if ($multiCarousels.length) {
			bindCarouselA11y($multiCarousels.eq(0), 'Proces treninga');
			bindCarouselA11y($multiCarousels.eq(1), 'Usluge');
			$multiCarousels.owlCarousel({
				center: false,
				items: 1,
				loop: true,
				stagePadding: 0,
				margin: 20,
				smartSpeed: 1000,
				autoplay: true,
				nav: true,
				navText: ['<span class="icon-keyboard_arrow_left">', '<span class="icon-keyboard_arrow_right">'],
				responsive: {
					600: { margin: 20, nav: true, items: 2 },
					1000: { margin: 20, stagePadding: 0, nav: true, items: 2 },
					1200: { margin: 20, stagePadding: 0, nav: true, items: 3 }
				}
			});
		}

		var $testimonialsCarousel = $('.owl-carousel-one');
		if ($testimonialsCarousel.length) {
			bindCarouselA11y($testimonialsCarousel, 'Svjedočanstva klijenata');
			$testimonialsCarousel.owlCarousel({
				center: false,
				items: 1,
				loop: true,
				stagePadding: 0,
				margin: 0,
				autoplay: true,
				pauseOnHover: false,
				nav: true,
				smartSpeed: 1000,
				navText: ['<span class="icon-keyboard_arrow_left">', '<span class="icon-keyboard_arrow_right">']
			});
		}
	}

	function initStickyHeader() {
		var header = document.querySelector('.js-sticky-header');
		if (!header) {
			return;
		}

		var wrapper = header.closest('.sticky-wrapper');
		if (!wrapper) {
			return;
		}

		function applyWrapperHeight(height) {
			wrapper.style.minHeight = Math.ceil(height) + 'px';
		}

		if ('ResizeObserver' in window) {
			var resizeObserver = new ResizeObserver(function (entries) {
				entries.forEach(function (entry) {
					applyWrapperHeight(entry.contentRect.height);
				});
			});

			resizeObserver.observe(header);
		} else {
			var syncHeight = function () {
				applyWrapperHeight(header.getBoundingClientRect().height);
			};

			requestAnimationFrame(syncHeight);
			window.addEventListener('resize', syncHeight);
		}

		var stickyActive = false;
		window.addEventListener('scroll', function () {
			var shouldStick = window.pageYOffset > 0;
			if (shouldStick !== stickyActive) {
				stickyActive = shouldStick;
				wrapper.classList.toggle('is-sticky', shouldStick);
			}
		}, { passive: true });
	}

	function initOnePageNavigation() {
		$('body').on('click', ".main-menu li a[href^='#'], .smoothscroll[href^='#'], .site-mobile-menu .site-nav-wrap li a", function (event) {
			var hash = this.hash;
			var $target = $(hash);
			if (!$target.length) {
				return;
			}

			event.preventDefault();
			$('html, body').animate({ scrollTop: $target.offset().top }, 600, 'easeInOutExpo', function () {
				window.location.hash = hash;
			});
			closeOffcanvasMenu();
		});
	}

	function initScrollState() {
		var header = document.querySelector('.js-sticky-header');
		var backToTop = document.getElementById('back-to-top');
		var shrinkActive = false;
		var backToTopVisible = false;

		window.addEventListener('scroll', function () {
			var offset = window.pageYOffset;
			var shouldShrink = offset > 100;
			var shouldShowBackToTop = offset > 300;

			if (header && shouldShrink !== shrinkActive) {
				shrinkActive = shouldShrink;
				header.classList.toggle('shrink', shouldShrink);
			}

			if (backToTop && shouldShowBackToTop !== backToTopVisible) {
				backToTopVisible = shouldShowBackToTop;
				backToTop.classList.toggle('visible', shouldShowBackToTop);
			}
		}, { passive: true });

		$('#back-to-top').on('click', function (event) {
			event.preventDefault();
			$('html, body').animate({ scrollTop: 0 }, 600, 'easeInOutExpo');
		});
	}

	initAOS();
	initMobileMenu();
	initCarousels();
	initStickyHeader();
	initOnePageNavigation();
	initScrollState();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSiteScripts);
} else {
	initSiteScripts();
}
