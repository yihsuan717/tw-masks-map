import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter, OnDestroy, ElementRef, QueryList } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, BehaviorSubject, Subscription, forkJoin, Subject, combineLatest } from 'rxjs';
import { City, Feature, FILTERS_ARR, FILTERS_TYPE } from 'src/app/models/data';
import { CdkVirtualScrollViewport, ScrollDispatcher } from '@angular/cdk/scrolling';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import * as dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import Fuse from 'fuse.js';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { filter, map, tap, takeUntil, debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { StorageMap } from '@ngx-pwa/local-storage';
import { latLng } from 'leaflet';
import { MatDialog } from '@angular/material/dialog';
import { AnnouncementImgComponent } from './dialog/announcement-img/announcement-img.component';

@Component({
  selector: 'side-content',
  templateUrl: './side-content.component.html',
  styleUrls: ['./side-content.component.scss']
})
export class SideContentComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() snavOpened = true;
  @Input() isMobile = false;
  @Output() toggleSnav: EventEmitter<any> = new EventEmitter();

  scrollShadow;

  encodeURI;
  nowDate;
  today;

  searchForm: FormGroup;
  filterArr;

  processing;

  @ViewChild('listTop') listTop: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageIndex;
  pageSize;
  length;

  tempPharmacysData: Array<any | Feature>;
  pagePharmacysData: Array<any | Feature>;
  favoritePharmacys: Array<string> = [];

  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private scrollDispatcher: ScrollDispatcher,
    private storage: StorageMap,
    public dataService: DataService,
    public dialog: MatDialog
  ) {
    // init variables
    this.encodeURI = encodeURI;
    this.nowDate = dayjs().format('YYYY-MM-DD');
    this.today = dayjs().locale('zh-tw').format('dddd');

    this.filterArr = FILTERS_ARR;

    this.processing = false;

    ['mask', 'map', 'filter', 'tap'].forEach(name => {
      this.matIconRegistry.addSvgIconInNamespace(
        'svg',
        name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/svg/${name}.svg`)
      );
    });

    this.searchForm = this.formBuilder.group({
      searchStr: '',
      filters: new Set()
    });

    // this.pageIndex = 0;
    // this.pageSize = 20;
    this.initPage();

  }

  ngOnInit(): void {

    this.storage.watch('favoritePharmacys').subscribe(
      data => {
        this.favoritePharmacys = data as any[] || [];
        console.log(data);
      }
    );

    this.dataService.loadPharmaciesGeoJson();

    combineLatest([
      this.dataService.allpharmacysData$,
      this.searchForm.valueChanges
        .pipe(
          startWith(this.searchForm.value),
          debounceTime(500),
          distinctUntilChanged()),
      // this.storage.watch('favoritePharmacys')
    ])
      .pipe(
        map(([allpharmacysData, searchFormValue/* , favoritePharmacys */]) => ({
          allpharmacysData,
          searchFormValue,
          // favoritePharmacys
        })),
        takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          console.log('data: ', data);
          this.processing = true;
          // const t0 = performance.now();

          const allPharmacysData: Array<any | Feature> = data && data.allpharmacysData && data.allpharmacysData.features ? data.allpharmacysData.features : [];
          this.tempPharmacysData = allPharmacysData;

          // reset extend properties
          this.tempPharmacysData.forEach(feature => {
            feature.properties.distance = undefined;
            feature.properties.distanceStr = undefined;
          });


          if (data.searchFormValue.searchStr) {
            // do fuzzy search power by Fuse.js
            const options: Fuse.FuseOptions<any> = {
              shouldSort: true, // 是否按分数对结果列表排序
              // includeScore: true, //  是否应将分数包含在结果集中。0分表示完全匹配，1分表示完全不匹配。
              threshold: 0.2, // 匹配算法阈值。阈值为0.0需要完全匹配（字母和位置），阈值为1.0将匹配任何内容。
              /**
                * 确定匹配与模糊位置（由位置指定）的距离。一个精确的字母匹配，即距离模糊位置很远的字符将被视为完全不匹配。
                *  距离为0要求匹配位于指定的准确位置，距离为1000则要求完全匹配位于使用阈值0.8找到的位置的800个字符以内。
                */
              location: 0, // 确定文本中预期找到的模式的大致位置。
              distance: 100,

              keys: ['properties.name', 'properties.address', 'properties.county', 'properties.town', 'properties.cunli'],
            };
            const fuse = new Fuse(allPharmacysData, options);
            this.tempPharmacysData = fuse.search(data.searchFormValue.searchStr);
            console.log('search res: ', this.tempPharmacysData, data.searchFormValue.searchStr);
          }
          this._pagePharmacysData(true);

          if (data.searchFormValue.filters && data.searchFormValue.filters.size) {
            data.searchFormValue.filters.forEach(value => {
              switch (value) {
                case FILTERS_TYPE.FAVORITE:
                  this.storage.get('favoritePharmacys').subscribe(
                    favoritePharmacys => {
                      this.tempPharmacysData = this.tempPharmacysData.filter(
                        item => (favoritePharmacys as any[] || []).includes(item.properties.id));
                      this._pagePharmacysData(true);
                    }
                  );
                  break;
                case FILTERS_TYPE.DISTANCE: // TODO: 搬出來獨立做，或是把this.tempPharmacysData包成obserable 做 this._pagePharmacysData ()
                  this.nearByList();
                  break;
                default:
              }
            });
          }


          // const t1 = performance.now();
          // console.log('processing ' + (t1 - t0) + ' milliseconds.');
          this.processing = false;
        }
      );
  }

  ngAfterViewInit(): void {

    // init mat-paginator intl
    this.paginator._intl.firstPageLabel = '第一頁';
    this.paginator._intl.itemsPerPageLabel = '每頁筆數';
    this.paginator._intl.lastPageLabel = '最後一頁';
    this.paginator._intl.nextPageLabel = '下一頁';
    this.paginator._intl.previousPageLabel = '上一頁';
    this.paginator._intl.getRangeLabel = (page, pageSize, length) => {
      if (length === 0 || pageSize === 0) {
        return ``;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      // If the start index exceeds the list length, do not try and fix the end index to the end.
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return `顯示 ${startIndex + 1} - ${endIndex} 項，共 ${length} 筆結果`;
    };
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  openAnnouncementImg() {
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const size = viewWidth > viewHeight ? (viewWidth * 0.6 > viewHeight ? `${viewHeight * 0.7}px` : `${viewWidth * 0.6}px`) : `${viewWidth * 0.8}px`;

    this.dialog.open(AnnouncementImgComponent, {
      panelClass: 'announcement-img',
      width: size, // img is square
      height: size,
    });
  }

  refreshData(event) {
    event.stopPropagation();
    this.dataService.loadPharmaciesGeoJson();
  }

  _toggleSnav() {
    this.toggleSnav.emit();
  }

  trackByFn(index, item) {
    return item.properties.id;
  }

  toggleFilterChip(id) {
    const filtersValue = this.searchForm.get('filters').value;
    if (filtersValue.has(id)) {
      filtersValue.delete(id);
    } else {
      filtersValue.add(id);
    }
    this.searchForm.get('filters').setValue(filtersValue);
  }

  scrollHandler(event) {
    if (event.target && event.target.scrollTop > 0) {
      this.scrollShadow = true;
    } else {
      this.scrollShadow = false;
    }
  }

  toogleFavorite(id) {
    this.storage.get('favoritePharmacys').subscribe(
      data => {
        if (data) {
          try {
            if (Array.isArray(data)) {
              if (data.includes(id)) {
                const idx = data.indexOf(id);
                if (idx !== -1) {
                  data.splice(idx, 1);
                }
                this.storage.set('favoritePharmacys', [...data]).subscribe();
              } else {
                this.storage.set('favoritePharmacys', data.concat([id])).subscribe();
              }
            }
          } catch (err) {
            console.error(err);
          }
        } else {
          this.storage.set('favoritePharmacys', [id]).subscribe();
        }
      });
  }

  navigatePharmacy(id, isBtn) {
    if (id) {
      this.dataService.setPharmacyId(id);
      if (this.isMobile && isBtn) {
        this._toggleSnav();
      }
    }
  }

  initPage() {
    this.pageIndex = 0;
    this.pageSize = 20;
  }

  onPage(event) {
    console.log(event);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._pagePharmacysData(false);

  }

  _pagePharmacysData(needReset) {
    if (needReset) {
      this.initPage();
    }

    // page data
    this.length = this.tempPharmacysData.length || 0;
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex < this.length ?
      Math.min(startIndex + this.pageSize, this.length) :
      startIndex + this.pageSize;
    this.pagePharmacysData = [...(this.length !== 0 ? this.tempPharmacysData.slice(startIndex, endIndex) : [])];
    if (this.listTop) {
      console.log('scroll to top');
      this.listTop.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  public nearByList(): void {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      this.processing = true;
      navigator.geolocation.getCurrentPosition((position) => {
        // position.coords.latitude, position.coords.longitude

        this.tempPharmacysData = this.tempPharmacysData.filter(item => {
          const from = latLng(position.coords.latitude, position.coords.longitude);
          const to = latLng(item.geometry.coordinates[1], item.geometry.coordinates[0]);
          const distance = from.distanceTo(to);
          // extend properties
          item.properties.distance = distance || undefined;
          item.properties.distanceStr = distance ? distance >= 1000 ? `${(distance / 1000).toFixed(1)} 公里` : `${Math.round(distance)} 公尺` : undefined;

          // filter <= 2000m (2km)
          return distance <= 2000;
        }).sort((a, b) => a.properties.distance - b.properties.distance);
        console.log('nearBy: ', [position.coords.latitude, position.coords.longitude], this.tempPharmacysData);

        this._pagePharmacysData(true);

        // TODO: bound map

        this.processing = false;
      }, (error) => {
        console.error(error);
        this.processing = false;
      });
    } else {
      // Browser doesn't support Geolocation
    }
  }
}
