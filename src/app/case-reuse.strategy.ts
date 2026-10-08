import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

/** Re-create the case screens when moving between cases, so each case gets fresh per-case UI state. */
@Injectable()
export class CaseReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig && future.paramMap.get('id') === curr.paramMap.get('id');
  }
}
