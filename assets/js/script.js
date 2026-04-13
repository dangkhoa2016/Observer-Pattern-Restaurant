(async () => {
  Helper.shuffle();

  const restaurant = new Restaurant({
    chef_holder: '#chef-holder',
    table_holder: '#table-holder',
    number_test_tables: 2,
    number_chefs: 2,
  });
  try {
    await restaurant.init();
  } catch (error) {
    Logger.error('Application bootstrap failed:', error);
    return;
  }

  const to_top = $('body > .to-top');
  $(window).scroll(function() {
    if (this.scrollY > 300)
      to_top.removeClass('d-none');
    else
      to_top.addClass('d-none');
  });
  to_top.click((e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
  });


  // demo
  (new bootstrap.Modal(document.getElementById('welcome-modal'))).show();

  let clearOrphanTooltipTimeout = null;
  const clearOrphanTooltip = function() {
    jQuery('.tooltip.show').remove();
    clearOrphanTooltipTimeout = setTimeout(clearOrphanTooltip, APP_TIMEOUTS.TOOLTIP_SWEEP_MS);
  };
  clearOrphanTooltip();

  $(window).on('beforeunload.app', function() {
    if (clearOrphanTooltipTimeout)
      clearTimeout(clearOrphanTooltipTimeout);
  });
  // demo

})();
