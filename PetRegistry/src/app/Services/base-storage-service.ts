import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface StorageEntity {
    id?: number;
}

export interface EntityFactory<T> {
    fromJS(data: unknown): T;
}

@Injectable({
    providedIn: 'root',
})
export abstract class BaseStorageService<T extends StorageEntity> {
    protected abstract readonly storageKey: string;
    protected abstract readonly entityFactory: EntityFactory<T>;

    protected getStorageData(): Observable<T[]> {
        return this.loadStorageData().pipe(
            map((entities: unknown[]) =>
                entities.map((entity: unknown) => this.entityFactory.fromJS(entity))
            ),
            catchError((error) =>
                throwError(() => new Error(`Failed to load ${this.storageKey}: ${error.message}`))
            )
        );
    }

    protected getEntityById(id: number): Observable<T> {
        return this.loadStorageData().pipe(
            map((entities: unknown[]) => {
                const entity = entities.find((e: unknown) => (e as StorageEntity).id === id);
                if (!entity) {
                    throw new Error(`Entity with id ${id} not found`);
                }
                return this.entityFactory.fromJS(entity);
            }),
            catchError((error) =>
                throwError(() => new Error(`Failed to get entity ${id}: ${error.message}`))
            )
        );
    }

    protected saveEntity(entity: T): Observable<T> {
        return this.loadStorageData().pipe(
            map((entities: unknown[]) => {
                const newId = entity.id ?? this.generateNewId(entities as StorageEntity[]);
                const newEntity = { ...entity, id: newId };
                entities.push(newEntity);
                this.saveStorageData(entities);
                return this.entityFactory.fromJS(newEntity);
            }),
            catchError((error) => throwError(() => new Error(`Failed to save entity: ${error.message}`)))
        );
    }

    protected updateEntity(id: number, entity: T): Observable<void> {
        return this.loadStorageData().pipe(
            map((entities: unknown[]) => {
                const typedEntities = entities as StorageEntity[];
                const index = typedEntities.findIndex((e) => e.id === id);

                if (index === -1) {
                    throw new Error(`Entity with id ${id} not found`);
                }

                typedEntities[index] = { ...entity, id };
                this.saveStorageData(typedEntities);
            }),
            catchError((error) =>
                throwError(() => new Error(`Failed to update entity ${id}: ${error.message}`))
            )
        );
    }

    protected deleteEntity(id: number): Observable<void> {
        return this.loadStorageData().pipe(
            map((entities: unknown[]) => {
                const typedEntities = entities as StorageEntity[];
                const index = typedEntities.findIndex((e) => e.id === id);

                if (index === -1) {
                    throw new Error(`Entity with id ${id} not found`);
                }

                typedEntities.splice(index, 1);
                this.saveStorageData(typedEntities);
            }),
            catchError((error) =>
                throwError(() => new Error(`Failed to delete entity ${id}: ${error.message}`))
            )
        );
    }

    clearStorage(): void {
        localStorage.removeItem(this.storageKey);
    }

    setData(entities: T[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(entities));
    }

    private loadStorageData(): Observable<unknown[]> {
        try {
            const data = localStorage.getItem(this.storageKey);

            if (data === null) {
                return of([]);
            }

            const parsed = JSON.parse(data);

            if (!Array.isArray(parsed)) {
                throw new Error('localStorage data is not an array');
            }

            return of(parsed);
        } catch (error) {
            return throwError(() => this.createParseError('Failed to parse localStorage data', error));
        }
    }

    private saveStorageData(entities: unknown[]): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(entities));
        } catch (error) {
            throw this.createStorageError(error);
        }
    }

    private generateNewId(entities: StorageEntity[]): number {
        if (entities.length === 0) return 1;
        return Math.max(...entities.map((e) => e.id ?? 0)) + 1;
    }

    private createParseError(message: string, error: unknown): Error {
        const errorMessage = error instanceof Error ? error.message : 'Parse failed';
        return new Error(`${message}: ${errorMessage}`);
    }

    private createStorageError(error: unknown): Error {
        const errorMessage = error instanceof Error ? error.message : 'Storage failed';
        return new Error(`Failed to save data: ${errorMessage}`);
    }
}
