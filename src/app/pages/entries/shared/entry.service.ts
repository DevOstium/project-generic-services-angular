import { Injectable, Injector } from '@angular/core';

import { Observable } from "rxjs";
import { flatMap, catchError, map } from "rxjs/operators";

import { BaseResourceService } from "../../../shared/services/base-resource.service";
import { CategoryService } from "../../categories/shared/category.service";
import { Entry } from "./entry.model";

import * as moment from "moment"

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry> {

  constructor(protected injector: Injector, private categoryService: CategoryService) { 
        
            super(   "api/entries"
                     ,injector
                     ,Entry.fromJson
                 );
    
    console.log(' Executando uma Função: Passar o nome da função sem os (), não executa a função '+
                ' Nesse caso, estamos apenas dizendo que é essa função que deverá ser executada  '+
                ' quando for solicitada '
                )
    console.log(Entry.fromJson);

  }

  create(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.create.bind(this));
  }

  update(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer( entry, super.update.bind(this) )
  }
  
  private setCategoryAndSendToServer( entry: Entry, sendFn: any ): Observable<Entry>{
    
        return this.categoryService.getById(entry.categoryId)
                                                            .pipe(
                                                                flatMap(category => {
                                                                                      entry.category = category;
                                                                                      return sendFn(entry)  // aqui eu executo o super.create ou super.update
                                                                                    }
                                                                      ),
                                                                catchError(this.handleError)
                                                              );
  }
 
  getByMonthAndYear(month: number, year: number): Observable<Entry[]> {
      return this.getAll()
                        .pipe(
                                map( entries => this.filterByMonthAndYear(entries, month, year) ) 
                             )
  }

  private filterByMonthAndYear(entries: Entry[], month: number, year: number) {
   
          return entries.filter ( entry => {
                                            const entryDate      = moment(entry.date, "DD/MM/YYYY");
                                            const monthMatches   = entryDate.month() + 1 == month;
                                            const yearMatches    = entryDate.year() == year;

                                            if(monthMatches && yearMatches) return entry;
                                          }
                                 )
  }

}