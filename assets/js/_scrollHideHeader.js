// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 20;

document.addEventListener("scroll", function(event){
    didScroll = true;
});

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    var st = window.scrollY;
    
    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;
    
    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st < lastScrollTop){
        // Scroll Down
        tal.showSecondaryHeader = false;
    } else {
        // Scroll Up
        //if(st + window.innerHeight < document.innerHeight) {
            tal.showSecondaryHeader = true;
        //}
    }
    
    lastScrollTop = st;
}