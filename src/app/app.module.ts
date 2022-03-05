import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './material/material.module';
import { FormsModule } from '@angular/forms';

import { MainPage } from './components/mainpage/mainpage.component';
import { AddAndEditNodeDialog } from './components/addandeditnode.dialog/addandeditnode.dialog';
import { AddGraphDialog } from './components/addgraph.dialog/addgraph.dialog';
import { AddAndEditWeightedEdge } from './components//addandeditweightededge.dialog/addandeditweightededge.dialog';

@NgModule({
  declarations: [
    AppComponent,
    MainPage,
    AddAndEditNodeDialog,
    AddGraphDialog,
    AddAndEditWeightedEdge,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    MainPage,
    AddAndEditNodeDialog,
    AddGraphDialog,
    AddAndEditWeightedEdge,
  ],
})
export class AppModule {}
