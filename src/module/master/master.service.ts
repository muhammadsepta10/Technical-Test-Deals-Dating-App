import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterAccessRepository } from 'src/db/project-db/entity/master-access/master-access.repository';
import { MasterScriptDTO } from './master.dto';
import { MasterScriptRepository } from 'src/db/project-db/entity/master-script/master-script.repository';
import { CacheService } from 'src/module/cache/cache.service';
import { MasterMenuRepository } from 'src/db/project-db/entity/master-menu/master-menu.repository';
import { MasterMediaRepository } from 'src/db/project-db/entity/master-media/master-media.repository';

@Injectable()
export class MasterService {
  constructor(private cacheService: CacheService) {}

  @InjectRepository(MasterAccessRepository)
  private masterAccessRepository: MasterAccessRepository;
  @InjectRepository(MasterScriptRepository)
  private masterScriptRepository: MasterScriptRepository;
  @InjectRepository(MasterMenuRepository)
  private masterMenuRepository: MasterMenuRepository;
  @InjectRepository(MasterMediaRepository)
  private masterMediaRepository: MasterMediaRepository;

  async listMenu(accessId: number) {
    let menu = [];
    const cacheKey = `menu${accessId < 1 ? '' : accessId}`;
    menu = await this.cacheService
      .get(cacheKey)
      .then(v => {
        return !v ? [] : JSON.parse(v);
      })
      .catch(() => {
        return [];
      });
    if (menu?.length < 1) {
      const menuDb = await this.masterMenuRepository
        .createQueryBuilder('menu')
        .innerJoin('menu.accessDet', 'accessDet')
        .innerJoin('accessDet.access', 'access')
        .where('access.code = :accessId AND menu.status = 1', {
          accessId
        })
        .select('menu.id', 'id')
        .addSelect('menu.icon', 'icon')
        .addSelect('menu.description', 'menu')
        .addSelect('menu.level', 'level')
        .addSelect('menu.header', 'header')
        .addSelect('menu.path', 'path')
        .addSelect('accessDet.m_insert', 'm_insert')
        .addSelect('accessDet.m_update', 'm_update')
        .addSelect('accessDet.m_delete', 'm_delete')
        .addSelect('accessDet.m_view', 'm_view')
        .addSelect('accessDet.m_export', 'm_export')
        .addSelect('accessDet.m_import', 'm_import')
        .addSelect('accessDet.m_nego', 'm_nego')
        .orderBy('menu.sort', 'ASC')
        .getRawMany();
      console.log(menuDb);
      menu = this._buildMenuTree(menuDb);
      await this.cacheService.set(cacheKey, JSON.stringify(menu), menu?.length < 1 ? 1 : 3600);
    }
    return menu;
  }

  async script(): Promise<MasterScriptDTO> {
    let data = {};
    const cacheKey = 'scriptCache';
    data = await this.cacheService.get(cacheKey).then(v => {
      return !v ? {} : JSON.parse(v);
    });
    if (Object.keys(data).length === 0) {
      const arrData = await this.masterScriptRepository
        .createQueryBuilder('script')
        .where('script.status = 1')
        .select(['id', 'name', 'banner', 'title', 'body', 'html_template'])
        .getRawMany();
      arrData.map(v => {
        data[v.name] = {
          title: v.title,
          banner: v.banner,
          body: v.body,
          html_template: v.html_template
        };
      });
      await this.cacheService.set(cacheKey, JSON.stringify(data), Object.keys(data).length === 0 ? 1 : 3600);
    }
    return data;
  }

  private _buildMenuTree(menuItems, header = 0) {
    const menuTree = [];
    menuItems
      .filter(item => item.header === header)
      .map(item => {
        if (!item?.child) {
          item.child = [];
        }
        const child = this._buildMenuTree(menuItems, item.id);
        if (child.length > 0) {
          item.child = child;
        }
        menuTree.push(item);
      });

    return menuTree;
  }

  async listAccess() {
    const data = await this.masterAccessRepository.find({
      where: { status: 1, is_show: 1 },
      select: ['id', 'code', 'description']
    });
    return data;
  }

  async listMedia() {
    const data = await this.masterMediaRepository.find({
      where: { status: 1 },
      select: ['id', 'name', 'code']
    });
    return data;
  }
}
