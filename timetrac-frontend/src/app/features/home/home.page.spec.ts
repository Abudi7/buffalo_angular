import { TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { TimeService } from '../../core/time.service';
import { I18nService } from '../../core/i18n.service';
import { of } from 'rxjs';

describe('HomePage', () => {
  let component: HomePage;
  let mockTimeService: jasmine.SpyObj<TimeService>;
  let mockI18nService: jasmine.SpyObj<I18nService>;

  beforeEach(() => {
    // Create mock services
    mockTimeService = jasmine.createSpyObj('TimeService', ['list', 'start', 'stop']);
    mockI18nService = jasmine.createSpyObj('I18nService', ['t', 'setLang']);
    
    // Setup default mock returns
    mockTimeService.list.and.returnValue(of([]));
    mockI18nService.t.and.returnValue('Mock Translation');

    TestBed.configureTestingModule({
      providers: [
        { provide: TimeService, useValue: mockTimeService },
        { provide: I18nService, useValue: mockI18nService },
      ],
    });
    
    // Create component instance
    component = TestBed.createComponent(HomePage).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds unique non-empty tags and clears input', () => {
    component.tagInput = ' ui ';
    component.addTag();
    expect(component.tags).toEqual(['ui']);
    expect(component.tagInput).toBe('');
    
    component.tagInput = 'ui';
    component.addTag();
    expect(component.tags).toEqual(['ui']);
  });

  it('does not add duplicate tags', () => {
    component.tagInput = 'test';
    component.addTag();
    expect(component.tags).toEqual(['test']);
    
    component.tagInput = 'test';
    component.addTag();
    expect(component.tags).toEqual(['test']);
  });

  it('does not add empty tags', () => {
    component.tagInput = '';
    component.addTag();
    expect(component.tags).toEqual([]);
    
    component.tagInput = '   ';
    component.addTag();
    expect(component.tags).toEqual([]);
  });

  it('removes tags correctly', () => {
    component.tags = ['tag1', 'tag2', 'tag3'];
    component.removeTag('tag2');
    expect(component.tags).toEqual(['tag1', 'tag3']);
  });
});


