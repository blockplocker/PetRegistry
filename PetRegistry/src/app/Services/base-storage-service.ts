import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
        return new Observable<T[]>((observer) => {
        const data = localStorage.getItem(this.storageKey);

        if (data === null) {
            observer.next([]);
            observer.complete();
            return;
        }

        this.parseAndValidateData(data, observer, (entities: unknown[]) => {
            const result = entities.map((entity) => this.entityFactory.fromJS(entity));
            observer.next(result);
            observer.complete();
        });
        });
    }

    protected getEntityById(id: number): Observable<T> {
        return new Observable<T>((observer) => {
        const data = localStorage.getItem(this.storageKey);

        if (data === null) {
            observer.error(new Error(`Entity with id ${id} not found - no data in storage`));
            return;
        }

        this.parseAndValidateData(data, observer, (entities: unknown[]) => {
            const entity = entities.find((e: unknown) => (e as StorageEntity).id === id);

            if (!entity) {
            observer.error(new Error(`Entity with id ${id} not found`));
            return;
            }

            const result = this.entityFactory.fromJS(entity);
            observer.next(result);
            observer.complete();
        });
        });
    }

    protected saveEntity(entity: T): Observable<T> {
        return new Observable<T>((observer) => {
        let entities: unknown[] = [];
        const existingData = localStorage.getItem(this.storageKey);

        if (existingData) {
            try {
            entities = JSON.parse(existingData);
            if (!Array.isArray(entities)) {
                entities = [];
            }
            } catch (parseError) {
            observer.error(this.createParseError('Invalid existing data', parseError));
            return;
            }
        }

        const newId = entity.id ?? this.generateNewId(entities as StorageEntity[]);
        const newEntity = { ...entity, id: newId };

        entities.push(newEntity);

        this.saveToStorage(entities, observer, () => {
            observer.next(this.entityFactory.fromJS(newEntity));
            observer.complete();
        });
        });
    }

    protected updateEntity(id: number, entity: T): Observable<void> {
        return new Observable<void>((observer) => {
        const data = localStorage.getItem(this.storageKey);

        if (data === null) {
            observer.error(new Error(`Cannot update entity with id ${id} - no data in storage`));
            return;
        }

        this.parseAndValidateData(data, observer, (entities: unknown[]) => {
            const typedEntities = entities as StorageEntity[];
            const index = typedEntities.findIndex((e) => e.id === id);

            if (index === -1) {
            observer.error(new Error(`Entity with id ${id} not found`));
            return;
            }

            typedEntities[index] = { ...entity, id };

            this.saveToStorage(typedEntities, observer, () => {
            observer.next();
            observer.complete();
            });
        });
        });
    }

    protected deleteEntity(id: number): Observable<void> {
        return new Observable<void>((observer) => {
        const data = localStorage.getItem(this.storageKey);

        if (data === null) {
            observer.error(new Error(`Cannot delete entity with id ${id} - no data in storage`));
            return;
        }

        this.parseAndValidateData(data, observer, (entities: unknown[]) => {
            const typedEntities = entities as StorageEntity[];
            const index = typedEntities.findIndex((e) => e.id === id);

            if (index === -1) {
            observer.error(new Error(`Entity with id ${id} not found`));
            return;
            }

            typedEntities.splice(index, 1);

            this.saveToStorage(typedEntities, observer, () => {
            observer.next();
            observer.complete();
            });
        });
        });
    }

    clearStorage(): void {
        localStorage.removeItem(this.storageKey);
    }

    setData(entities: T[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(entities));
    }

    private parseAndValidateData<R>(
        data: string,
        observer: { error: (error: Error) => void },
        onSuccess: (entities: unknown[]) => void
    ): void {
        let parsed: unknown;
        try {
        parsed = JSON.parse(data);
        } catch (parseError) {
        observer.error(this.createParseError('Invalid JSON in localStorage', parseError));
        return;
        }

        if (!Array.isArray(parsed)) {
        observer.error(new Error('localStorage data is not an array'));
        return;
        }

        try {
        onSuccess(parsed);
        } catch (mappingError) {
        observer.error(this.createMappingError(mappingError));
        }
    }

    private saveToStorage(
        entities: unknown[],
        observer: { error: (error: Error) => void },
        onSuccess: () => void
    ): void {
        try {
        localStorage.setItem(this.storageKey, JSON.stringify(entities));
        onSuccess();
        } catch (storageError) {
        observer.error(this.createStorageError(storageError));
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

    private createMappingError(error: unknown): Error {
        const errorMessage = error instanceof Error ? error.message : 'Mapping failed';
        return new Error(`Failed to map entity data: ${errorMessage}`);
    }

    private createStorageError(error: unknown): Error {
        const errorMessage = error instanceof Error ? error.message : 'Storage failed';
        return new Error(`Failed to save data: ${errorMessage}`);
    }
}
