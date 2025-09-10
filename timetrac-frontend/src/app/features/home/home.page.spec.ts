import { TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { TimeService } from '../../core/time.service';
import { of } from 'rxjs';

describe('HomePage', () => {
  let component: HomePage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TimeService, useValue: { list: () => of([]) } },
      ],
    });
    component = new HomePage(TestBed.inject(TimeService) as any);
    component.ngOnInit();
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
});


