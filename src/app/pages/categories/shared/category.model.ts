import { BaseResourceModel } from "../../../shared/models/base-resource.model";

export class Category extends BaseResourceModel {
  
  constructor(
        public id?:number,
        public name?: string,
        public description?: string
    ){
      super();  /// Usar sempre que eu uso o extends
    }
  

  static fromJson(jsonData: any): Category {
    return Object.assign(new Category(), jsonData);
  }


  static outroMethod(): string {
    return 'Teste chamando outro method';
  }
}