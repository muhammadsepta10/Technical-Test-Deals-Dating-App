import { MasterService } from './master.service';

describe('MasterService', () => {
  let masterService: MasterService;
  let cacheServiceMock: any;
  let masterMenuRepositoryMock: any;
  let masterScriptRepositoryMock: any;
  let masterAccessRepositoryMock: any;
  let masterMediaRepositoryMock: any;

  beforeEach(() => {
    // Mocking dependencies
    cacheServiceMock = {
      get: jest.fn(),
      set: jest.fn()
    };
    masterMenuRepositoryMock = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn()
    };
    masterScriptRepositoryMock = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn()
    };
    masterAccessRepositoryMock = {
      find: jest.fn()
    };
    masterMediaRepositoryMock = {
      find: jest.fn()
    };

    // Instantiating the service with mocks
    masterService = new MasterService(cacheServiceMock);
    (masterService as any).masterMenuRepository = masterMenuRepositoryMock;
    (masterService as any).masterScriptRepository = masterScriptRepositoryMock;
    (masterService as any).masterAccessRepository = masterAccessRepositoryMock;
    (masterService as any).masterMediaRepository = masterMediaRepositoryMock;
  });

  describe('listMenu', () => {
    it('should return cached menu if available', async () => {
      cacheServiceMock.get.mockResolvedValue(JSON.stringify([{ id: 1, name: 'Dashboard' }]));

      const result = await masterService.listMenu(1);

      expect(cacheServiceMock.get).toHaveBeenCalledWith('menu1');
      expect(result).toEqual([{ id: 1, name: 'Dashboard' }]);
    });

    it('should fetch menu from database if cache is empty', async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      masterMenuRepositoryMock.getRawMany.mockResolvedValue([
        { id: 1, icon: 'icon', description: 'Dashboard', level: 1 }
      ]);

      const result = await masterService.listMenu(1);

      expect(masterMenuRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('menu');
      expect(result).toEqual([{ id: 1, icon: 'icon', description: 'Dashboard', level: 1, child: [] }]);
    });
  });

  describe('script', () => {
    it('should return cached script if available', async () => {
      cacheServiceMock.get.mockResolvedValue(JSON.stringify({ testScript: { title: 'Test Title' } }));

      const result = await masterService.script();

      expect(result).toEqual({ testScript: { title: 'Test Title' } });
    });

    it('should fetch script from database if cache is empty', async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      masterScriptRepositoryMock.getRawMany.mockResolvedValue([
        {
          name: 'testScript',
          title: 'Test Title',
          banner: 'Test Banner',
          body: 'Test Body',
          html_template: 'Test Template'
        }
      ]);

      const result = await masterService.script();

      expect(result).toEqual({
        testScript: {
          title: 'Test Title',
          banner: 'Test Banner',
          body: 'Test Body',
          html_template: 'Test Template'
        }
      });
    });
  });

  describe('listAccess', () => {
    it('should return list of access', async () => {
      const accessData = [{ id: 1, code: 'ADMIN', description: 'Administrator' }];
      masterAccessRepositoryMock.find.mockResolvedValue(accessData);

      const result = await masterService.listAccess();

      expect(result).toEqual(accessData);
    });
  });

  describe('listMedia', () => {
    it('should return list of media', async () => {
      const mediaData = [{ id: 1, name: 'Media 1', code: 'MEDIA1' }];
      masterMediaRepositoryMock.find.mockResolvedValue(mediaData);

      const result = await masterService.listMedia();

      expect(result).toEqual(mediaData);
    });
  });
});
