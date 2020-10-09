export interface IMapAngularModule {
  moduleName?: string;
  Init?();
  DisableModule?();
  GetTranslations();
}
