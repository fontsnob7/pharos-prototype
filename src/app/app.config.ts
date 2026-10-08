import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouteReuseStrategy, provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { CaseReuseStrategy } from './case-reuse.strategy';
import {
  ArrowLeftOutline, ArrowsAltOutline, BellOutline, CaretDownOutline, CaretUpOutline, CheckCircleFill, CheckCircleOutline, CheckOutline,
  CloseCircleFill, CloseOutline, DoubleLeftOutline, DoubleRightOutline, DownOutline, DownloadOutline, EditOutline, EnvironmentFill,
  ExclamationCircleFill, ExportOutline, EyeOutline, FileExcelOutline, FileImageOutline, FileOutline, FilePdfOutline, FileWordOutline,
  FilterFill, HomeOutline, InboxOutline, InfoCircleFill, InfoCircleOutline, LeftOutline, LoadingOutline, LogoutOutline, PaperClipOutline,
  PlusCircleOutline, PlusOutline, PushpinFill, RightOutline, RobotOutline, SearchOutline, SettingOutline, SwapOutline, ThunderboltOutline,
  UpOutline, UserOutline, WarningFill,
} from '@ant-design/icons-angular/icons';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';

import { routes } from './app.routes';

const icons = [
  ArrowLeftOutline, ArrowsAltOutline, BellOutline, CaretDownOutline, CaretUpOutline, CheckCircleFill, CheckCircleOutline, CheckOutline,
  CloseCircleFill, CloseOutline, DoubleLeftOutline, DoubleRightOutline, DownOutline, DownloadOutline, EditOutline, EnvironmentFill,
  ExclamationCircleFill, ExportOutline, EyeOutline, FileExcelOutline, FileImageOutline, FileOutline, FilePdfOutline, FileWordOutline,
  FilterFill, HomeOutline, InboxOutline, InfoCircleFill, InfoCircleOutline, LeftOutline, LoadingOutline, LogoutOutline, PaperClipOutline,
  PlusCircleOutline, PlusOutline, PushpinFill, RightOutline, RobotOutline, SearchOutline, SettingOutline, SwapOutline, ThunderboltOutline,
  UpOutline, UserOutline, WarningFill,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Hash routing so the prototype also works when served as static files (e.g. GitHub Pages).
    provideRouter(routes, withHashLocation(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    { provide: RouteReuseStrategy, useClass: CaseReuseStrategy },
    provideAnimationsAsync(),
    provideNzIcons(icons),
    provideNzI18n(en_US),
  ],
};
