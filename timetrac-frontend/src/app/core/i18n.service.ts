// Lightweight i18n service with in-memory dictionaries (en, ar, de).
// Keeps current language in localStorage and provides translate() helper.
import { Injectable } from '@angular/core';

type Lang = 'en' | 'ar' | 'de';

const DICTS: Record<Lang, Record<string, string>> = {
  en: {
    app_title: 'TimeTrac',
    track_time: 'Track Time',
    select_project_tags_note_color: 'Select project, tags, note & color',
    tags: 'Tags',
    note: 'Note',
    refresh: 'Refresh',
    export_csv: 'Export CSV',
    start: 'Start',
    stop: 'Stop',
    entries: 'Entries',
    newest_first: 'Newest first',
    no_entries: 'No entries yet. Start your first session!'
  },
  ar: {
    app_title: 'تايم ترك',
    track_time: 'تتبع الوقت',
    select_project_tags_note_color: 'اختر المشروع، الوسوم، الملاحظة واللون',
    tags: 'الوسوم',
    note: 'ملاحظة',
    refresh: 'تحديث',
    export_csv: 'تصدير CSV',
    start: 'ابدأ',
    stop: 'أوقف',
    entries: 'السجلات',
    newest_first: 'الأحدث أولاً',
    no_entries: 'لا توجد سجلات بعد. ابدأ أول جلسة!'
  },
  de: {
    app_title: 'TimeTrac',
    track_time: 'Zeit erfassen',
    select_project_tags_note_color: 'Projekt, Tags, Notiz & Farbe wählen',
    tags: 'Tags',
    note: 'Notiz',
    refresh: 'Aktualisieren',
    export_csv: 'CSV exportieren',
    start: 'Start',
    stop: 'Stopp',
    entries: 'Einträge',
    newest_first: 'Neueste zuerst',
    no_entries: 'Noch keine Einträge. Starte deine erste Sitzung!'
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private current: Lang = (localStorage.getItem('lang') as Lang) || 'en';

  get lang(): Lang { return this.current; }

  setLang(l: Lang) {
    this.current = l;
    localStorage.setItem('lang', l);
    document.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }

  t(key: string): string {
    const dict = DICTS[this.current] || DICTS.en;
    return dict[key] || key;
  }
}


