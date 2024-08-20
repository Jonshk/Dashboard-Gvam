import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export interface Menu {
  headTitle1?: string;
  level?: number;
  path?: string;
  title?: string;
  icon?: string;
  type?: string;
  active?: boolean;
  id?: number;
  bookmark?: boolean;
  children?: Menu[];
  horizontalList?: boolean;
  items?: Menu[];
}

@Injectable({
  providedIn: 'root',
})
export class NavmenuService {
  public isDisplay!: boolean;
  public language: boolean = false;
  public isShow: boolean = false;
  public closeSidebar: boolean = false;

  constructor() {}

  MENUITEMS: Menu[] = [
    {
      headTitle1: 'General',
    },
    {
      level: 1,
      id: 1,
      path: '/groups',
      bookmark: true,
      title: 'Grupos',
      icon: 'home',
      type: 'link',
    },
    {
      level: 1,
      id: 2,
      path: '/applications',
      bookmark: true,
      title: 'Aplicaciones',
      icon: 'file',
      type: 'link',
    },
  ];

  item = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
