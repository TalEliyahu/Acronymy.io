import { AcronymPage } from './app.po';

describe('acronym App', () => {
  let page: AcronymPage;

  beforeEach(() => {
    page = new AcronymPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
