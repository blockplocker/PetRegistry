import { Injectable } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RouteParamService {
  /**
   * Gets the ID parameter from the provided route and returns it as a number.
   * @param activatedRoute - The ActivatedRoute instance from the component
   * @param paramName - The name of the route parameter (defaults to 'id')
   * @returns The ID as a number, or null if the parameter doesn't exist or is not a valid number
   */
  getIdParam(activatedRoute: ActivatedRoute, paramName: string = 'id'): number | null {
    const paramValue = activatedRoute.snapshot.paramMap.get(paramName);

    if (!paramValue) {
      return null;
    }

    const numericValue = Number(paramValue);

    if (isNaN(numericValue) || !Number.isInteger(numericValue) || numericValue <= 0) {
      return null;
    }

    return numericValue;
  }

  /**
   * Gets the ID parameter from the provided route as an observable that emits numbers.
   * Useful when you need to react to route parameter changes.
   * @param activatedRoute - The ActivatedRoute instance from the component
   * @param paramName - The name of the route parameter (defaults to 'id')
   * @returns Observable that emits the ID as a number, or null if invalid
   */
  getIdParam$(activatedRoute: ActivatedRoute, paramName: string = 'id') {
    return activatedRoute.paramMap.pipe(
      map((params: ParamMap) => {
        const paramValue = params.get(paramName);

        if (!paramValue) {
          return null;
        }

        const numericValue = Number(paramValue);

        if (isNaN(numericValue) || !Number.isInteger(numericValue) || numericValue <= 0) {
          return null;
        }

        return numericValue;
      })
    );
  }

  /**
   * Gets any string parameter from the provided route.
   * @param activatedRoute - The ActivatedRoute instance from the component
   * @param paramName - The name of the route parameter
   * @returns The parameter value as a string, or null if it doesn't exist
   */
  getStringParam(activatedRoute: ActivatedRoute, paramName: string): string | null {
    return activatedRoute.snapshot.paramMap.get(paramName);
  }

  /**
   * Gets any string parameter from the provided route as an observable.
   * @param activatedRoute - The ActivatedRoute instance from the component
   * @param paramName - The name of the route parameter
   * @returns Observable that emits the parameter value as a string, or null if it doesn't exist
   */
  getStringParam$(activatedRoute: ActivatedRoute, paramName: string) {
    return activatedRoute.paramMap.pipe(map((params: ParamMap) => params.get(paramName)));
  }
}
