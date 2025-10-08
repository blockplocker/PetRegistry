import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private translate = inject(TranslateService);

  ngOnInit() {
    const savedLanguage = localStorage.getItem('selectedLanguage');

    if (savedLanguage && ['en', 'de', 'es', 'fr', 'sv'].includes(savedLanguage)) {
      this.translate.use(savedLanguage);
    } else {
      const browserLang = this.translate.getBrowserLang();
      const selectedLang = browserLang?.match(/en|de|es|fr|sv/) ? browserLang : 'en';
      this.translate.use(selectedLang);
      localStorage.setItem('selectedLanguage', selectedLang);
    }
  }
}
