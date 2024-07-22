import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterMenuRepository } from 'src/db/project-db/entity/master-menu/master-menu.repository';
import { CacheService } from '../cache/cache.service';
import { MasterAccessRepository } from 'src/db/project-db/entity/master-access/master-access.repository';
import { MasterBankRepository } from 'src/db/project-db/entity/master-bank/master-bank.repository';
import { MasterMediaRepository } from 'src/db/project-db/entity/master-media/master-media.repository';
import { MasterNewsCategoryRepository } from 'src/db/project-db/entity/master-news-category/master-news-category.repository';
import { MasterInvalidReasonRepository } from 'src/db/project-db/entity/master-invalid-reason/master-invalid-reason.repository';
import { ListReasonDTO } from './master.dto';
import { MoreThan } from 'typeorm';

@Injectable()
export class MasterService {
  constructor(private cacheService: CacheService) {}

  @InjectRepository(MasterMenuRepository) private masterMenuRepository: MasterMenuRepository;
  @InjectRepository(MasterAccessRepository) private masterAccessRepository: MasterAccessRepository;
  @InjectRepository(MasterBankRepository) private masterBankRepository: MasterBankRepository;
  @InjectRepository(MasterMediaRepository) private masterMediaRepository: MasterMediaRepository;
  @InjectRepository(MasterNewsCategoryRepository) private masterNewsCategoryRepository: MasterNewsCategoryRepository;
  @InjectRepository(MasterInvalidReasonRepository) private masterInvalidReasonRepository: MasterInvalidReasonRepository;

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
        .where('accessDet.accessId = :accessId AND menu.status = 1', {
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
      menu = this._buildMenuTree(menuDb);
      await this.cacheService.set(cacheKey, JSON.stringify(menu), menu?.length < 1 ? 1 : 3600);
    }
    return menu;
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

  async listBank() {
    const data = await this.masterBankRepository.find({ where: { status: 1 }, select: ['id', 'code', 'name'] });
    return data;
  }

  async listMedia() {
    const data = await this.masterMediaRepository.find({ where: { status: 1 }, select: ['id', 'name', 'code'] });
    return data;
  }

  async newsCategory() {
    const data = await this.masterNewsCategoryRepository.find({ where: { status: 1 }, select: ['id', 'description'] });
    return data;
  }

  async invalidReason(param: ListReasonDTO) {
    const { type } = param;
    const whereType = type > 0 ? type : MoreThan(0);
    const data = await this.masterInvalidReasonRepository.find({
      where: { status: 1, type: whereType },
      select: ['id', 'name']
    });
    return data;
  }
}