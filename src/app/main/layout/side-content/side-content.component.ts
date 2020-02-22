import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, BehaviorSubject, Subscription, forkJoin } from 'rxjs';
import { City, Feature } from 'src/app/models/data';
import { CdkVirtualScrollViewport, ScrollDispatcher } from '@angular/cdk/scrolling';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'side-content',
  templateUrl: './side-content.component.html',
  styleUrls: ['./side-content.component.scss']
})
export class SideContentComponent implements OnInit, AfterViewInit {

  @Input() snavOpened = true;
  @Input() isMobile = false;
  @Output() toggleSnav: EventEmitter<any> = new EventEmitter();

  encodeURI;
  nowDate;
  today;

  searchForm: FormGroup;

  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
  batch = 10;
  theEnd = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private scrollDispatcher: ScrollDispatcher,
    public dataService: DataService
  ) {
    this.encodeURI = encodeURI;
    this.nowDate = dayjs().format('YYYY-MM-DD');
    this.today = dayjs().locale('zh-tw').format('dddd');

    this.matIconRegistry.addSvgIconInNamespace(
      'svg',
      'mask',
      this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/svg/mask.svg`)
    );

    this.searchForm = this.formBuilder.group({
      search: '',
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {

    this.paginator._intl.firstPageLabel = '第一頁';
    this.paginator._intl.itemsPerPageLabel = '每頁筆數';
    this.paginator._intl.lastPageLabel = '最後一頁';
    this.paginator._intl.nextPageLabel = '下一頁';
    this.paginator._intl.previousPageLabel = '上一頁';
    this.paginator._intl.getRangeLabel = (page, pageSize, length) => {
      if (length === 0 || pageSize === 0) {
        return `0 共 ${length}`;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      // If the start index exceeds the list length, do not try and fix the end index to the end.
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} 共 ${length} 筆`;
    };
  }

  loadData() {
    forkJoin(
      this.dataService.loadCitys(),
      this.dataService.loadPharmacys(0, 10)
    ).subscribe();
  }

  _toggleSnav() {
    this.toggleSnav.emit();
  }

  trackByFn(index, item) {
    return item.properties.id;
  }

  scrolling(e) {
    // if (this.theEnd) {
    //   return;
    // }

    // const end = this.viewport.getRenderedRange().end;
    // const total = this.viewport.getDataLength();
    // console.log(`${end}, '>=', ${total}`);
    // if (end === total) {
    //   console.log(`${end}, '===', ${total}`);
    //   // this.offset.next(offset);
    // }
  }

  onPage(event) {
    console.log(event);
    this.dataService.loadPharmacys(event.pageIndex, event.pageSize).subscribe();
    this.viewport.scrollToOffset(0);
  }
}
