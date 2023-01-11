class Template {
  #parts = ['panel-action', 'welcome-modal', 'main-app', 'modal-foods', 'modal-confirm'];

  async init() {
    if (
      Food.template === null ||
      Table.template === null ||
      Chef.template === null
    ) {
      const res = await $.get('/assets/template/handlebar.html');
      const coll = $(res);

      Food.template = Handlebars.compile(coll.filter('#tmp-food').html());
      Table.template = Handlebars.compile(coll.filter('#tmp-table').html());
      Table.template_foods = Handlebars.compile(coll.filter('#tmp-food-list').html());
      Chef.template = Handlebars.compile(coll.filter('#tmp-chef').html());
      Assistant.template = Handlebars.compile(coll.filter('#tmp-assistant').html());
      Assistant.template_receive = Handlebars.compile(coll.filter('#tmp-assistant-receive').html());
      Assistant.template_info = Assistant.template_receive;
      Progress.template_pg = Handlebars.compile(coll.filter('#tmp-progress').html());
      Progress.template_pg_bar = Handlebars.compile(coll.filter('#tmp-progress-bar').html());
    }

    await this.#render_parts();
  }

  async #render_parts() {
    const res = await $.get('/assets/template/parts.html');
    const coll = $(res);
    for (const part of this.#parts)
      $(part).replaceWith(coll.filter(`#${part}`));
  }
}
