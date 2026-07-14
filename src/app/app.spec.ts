import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideTestTransloco } from './core/testing/provide-test-transloco';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideTestTransloco()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
