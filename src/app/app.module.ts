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
import { AddAndEditWeightedEdge } from './components/addandeditweightededge.dialog/addandeditweightededge.dialog';
import { RandomGraph } from './components/randomgraph.component/randomgraph.component';
import { Algorithms } from './components/algorithms.component/algorithms.component';
import { MessageDialog } from './components/message.dialog/message.dialog';
import { StorageSavedDialog } from './components/storagesaved.dialog/storagesaved.dialog';
import { StepsCounterDialog } from './components/stepscounter.dialog/stepscounter.dialog';
import { ConfirmDialog } from './components/confirm.dialog/confirm.dialog';

@NgModule({
  declarations: [
    AppComponent,
    MainPage,
    AddAndEditNodeDialog,
    AddGraphDialog,
    AddAndEditWeightedEdge,
    RandomGraph,
    Algorithms,
    MessageDialog,
    StorageSavedDialog,
    StepsCounterDialog,
    ConfirmDialog,
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
    RandomGraph,
    Algorithms,
    MessageDialog,
    StorageSavedDialog,
    StepsCounterDialog,
    ConfirmDialog,
  ],
})
export class AppModule {}
