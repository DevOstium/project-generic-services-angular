import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BaseResourceModel } from "../../models/base-resource.model"
import { BaseResourceService } from "../../services/base-resource.service"
import { switchMap } from "rxjs/operators";
import toastr from "toastr";

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked{
  
  currentAction         :  string;
  resourceForm          :  FormGroup;
  pageTitle             :  string;
  serverErrorMessages   :  string[] = null;
  submittingForm        :  boolean  = false;

  protected route       :  ActivatedRoute;
  protected router      :  Router;
  protected formBuilder :  FormBuilder;

  constructor(
              protected  injector             : Injector,
              public     resource             : T,  //  = new Category()
              protected  resourceService      : BaseResourceService<T>,   // injetando da mesma forma que uma interface
              protected  jsonDataToResourceFn : (jsonData) => T  // recebe jsonData e retorna um tipo T
            ) {  

        this.route       = this.injector.get(ActivatedRoute);
        this.router      = this.injector.get(Router);
        this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit() {
        this.setCurrentAction();
        this.buildResourceForm();
        this.loadResource();
  }

  ngAfterContentChecked(){
         this.setPageTitle();
  }

  // Uso para construir formulário, para tela tem um form diferente.
    protected abstract buildResourceForm(): void;

  submitForm(){
          this.submittingForm = true;

          if(this.currentAction == "new")
              this.createResource();
          else // currentAction == "edit"
                this.updateResource();
  }


  // PRIVATE METHODS

  protected setCurrentAction() {
        if(this.route.snapshot.url[0].path == "new")
            this.currentAction = "new"
        
        else
            this.currentAction = "edit"
  }

  protected loadResource() {
    if (this.currentAction == "edit") {
      
                this.route.paramMap.pipe(
                                          switchMap(params => this.resourceService.getById(+params.get("id")))
                                        )
                                      .subscribe(
                                                   (resource) => {
                                                                console.log("findVyID " , resource)
                                                                this.resource = resource;
                                                                this.resourceForm.patchValue(resource) // binds loaded resource data to resourceForm
                                                              },
                                                              (error) => alert('Ocorreu um erro no servidor, tente mais tarde.')
                                                )
    } // end if
  }

  protected setPageTitle() {
                          if (this.currentAction == 'new')
                                 this.pageTitle = this.creationPageTitle();
                          else{
                                  this.pageTitle = this.editionPageTitle();
                          }
  }

  protected creationPageTitle(): string {
    return "Novo"
  }

  protected editionPageTitle(): string {
    return "Edição"
  }


  protected createResource(){
            const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);  // this.resourceForm.value são os dados do formulário
            
            this.resourceService.create(resource)
                                                .subscribe(
                                                          resource => this.actionsForSuccess(resource),
                                                          error    => this.actionsForError(error)
                                                )
  }


  protected updateResource(){
              const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);  // para o json do form com isso this.resourceForm.value
              alert(resource)
              this.resourceService.update(resource)
                                                  .subscribe(
                                                              resource => this.actionsForSuccess(resource),
                                                              error    => this.actionsForError(error)
                                                  )
  }

  
  protected actionsForSuccess( resource: T ){
          toastr.success("Solicitação processada com sucesso!");

          // parent pego o pai da rota
          //this.route.snapshot me retorna uma fotografia da rota atual
          const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

          alert(baseComponentPath  + " -- " + resource.id)

          // redirect/reload component page
          this.router.navigateByUrl( baseComponentPath, {skipLocationChange: true} )
                     .then(
                              () => this.router.navigate( [ baseComponentPath, resource.id, "edit" ] )
                          )
   }


  protected actionsForError( error ) {
        toastr.error("Ocorreu um erro ao processar a sua solicitação!");

        this.submittingForm = false;

        if(error.status === 422)
              this.serverErrorMessages = JSON.parse(error._body).errors;
        else
              this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]
  }

    

}
