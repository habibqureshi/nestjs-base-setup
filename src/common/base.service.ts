/* eslint-disable */
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import { BaseEntity } from './base-entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PaginationOptions } from './types/common.types';

export class BaseService<Entity extends BaseEntity> {
  constructor(private readonly repository: Repository<Entity>) {}

  private applySelect(
    queryBuilder: SelectQueryBuilder<Entity>,
    select: FindOneOptions<Entity>['select'],
  ): void {
    if (!select) return;

    if (Array.isArray(select)) {
      queryBuilder.select(select.map((field) => `entity.${String(field)}`));
    } else {
      const selectedFields = Object.entries(select)
        .filter(([_, selected]) => selected)
        .map(([field]) => `entity.${field}`);
      queryBuilder.select(selectedFields);
    }
  }

  public async findOneOrNull(
    options: FindOneOptions<Entity>,
  ): Promise<Entity | null> {
    options.where = this.applyDefaultFilters(options.where ?? {});

    if (!options.order || this.isSimpleOrder(options.order)) {
      return await this.repository.findOne(options);
    }
    const queryBuilder = this.repository.createQueryBuilder('entity');

    queryBuilder.where(options.where);

    if (options.relations) {
      this.applyRelations(queryBuilder, options.relations, options.select);
    }
    this.applySelect(queryBuilder, options.select);
    if (options.order) {
      this.applyOrderBy(queryBuilder, options.order);
    }
    return await queryBuilder.getOne();
  }

  public async findManyWithPagination(
    options: FindManyOptions<Entity>,
    paginationOptions: PaginationOptions,
    sortByNewest: boolean = true,
    searchOptions?: {
      searchTerm?: string;
      searchFields?: string[];
      fromDate?: Date;
      toDate?: Date;
    },
  ): Promise<Pagination<Entity, IPaginationMeta>> {
    const queryBuilder = this.repository.createQueryBuilder('entity');

    if (options.relations) {
      this.applyRelations(queryBuilder, options.relations, options.select);
    } else if (options.select) {
      queryBuilder.select([]);
      this.applySelectRevamped(queryBuilder, options.select, 'entity');
    }

    queryBuilder.where(this.applyDefaultFilters(options.where ?? {}));

    if (options.order) {
      Object.entries(options.order).forEach(([key, value]) => {
        queryBuilder.addOrderBy(`entity.${key}`, value);
      });
    }

    if (searchOptions?.searchTerm && searchOptions?.searchFields) {
      this.applySearch(
        queryBuilder,
        searchOptions.searchTerm,
        searchOptions.searchFields,
      );
    }

    if (searchOptions?.fromDate && searchOptions?.toDate) {
      this.applyDateRange(
        queryBuilder,
        searchOptions.fromDate,
        searchOptions.toDate,
      );
    }

    if (sortByNewest) {
      queryBuilder.addOrderBy('entity.id', 'DESC');
    }

    const countQueryBuilder = this.repository.createQueryBuilder('entity');

    // Relations should be above where clause
    if (options.relations) {
      this.applyRelations(countQueryBuilder, options.relations, options.select);
    }

    countQueryBuilder.where(this.applyDefaultFilters(options.where ?? {}));

    if (searchOptions?.searchTerm && searchOptions?.searchFields) {
      this.applySearch(
        countQueryBuilder,
        searchOptions.searchTerm,
        searchOptions.searchFields,
      );
    }

    if (searchOptions?.fromDate && searchOptions?.toDate) {
      this.applyDateRange(
        countQueryBuilder,
        searchOptions.fromDate,
        searchOptions.toDate,
      );
    }

    countQueryBuilder.select('COUNT(DISTINCT entity.id)', 'count');
    return this.executePaginatedQuery(
      queryBuilder,
      paginationOptions,
      countQueryBuilder,
    );
  }

  public async findMany(options: FindManyOptions<Entity>): Promise<Entity[]> {
    options.where = this.applyDefaultFilters(options.where ?? {});
    return this.repository.find(options);
  }

  public async save(data: DeepPartial<Entity>): Promise<Entity> {
    return this.repository.save(this.repository.create(data));
  }

  public async softDeleteById(id: number): Promise<UpdateResult | null> {
    const where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[] =
      this.applyDefaultFilters({
        id,
      } as FindOptionsWhere<Entity>);

    const entity = await this.repository.findOne({ where });
    if (!entity) {
      return null;
    }
    entity.enable = false;
    entity.deleted = true;
    await this.repository.save(entity);
    return await this.repository.softDelete(id);
  }

  public async softDelete(
    criteria: FindOptionsWhere<Entity>,
  ): Promise<UpdateResult> {
    const filteredCriteria = this.applyDefaultFilters(criteria);

    await this.repository.update(filteredCriteria, {
      enable: false,
      deleted: true,
    } as unknown as QueryDeepPartialEntity<Entity>);
    return await this.repository.softDelete(filteredCriteria);
  }

  public async updateById(
    options: FindOneOptions<Entity>,
    updateData: DeepPartial<Entity>,
  ): Promise<Entity | null> {
    const entity = await this.repository.findOne(options);
    if (!entity) {
      return null;
    }
    return await this.repository.save({ ...entity, ...updateData });
  }

  private isSimpleOrder(order: FindOptionsOrder<Entity>): boolean {
    return Object.values(order).every(
      (value) =>
        typeof value === 'string' && (value === 'ASC' || value === 'DESC'),
    );
  }

  public applyRelations(
    queryBuilder: SelectQueryBuilder<Entity>,
    relations: FindManyOptions<Entity>['relations'],
    selection: FindManyOptions<Entity>['select'],
  ): void {
    if (!relations) return;

    const joinedRelations = new Set<string>();

    // Handle root entity selection
    if (selection) {
      if (Array.isArray(selection)) {
        queryBuilder.select(
          selection.map((field) => `entity.${String(field)}`),
        );
      } else {
        const selectedFields = Object.entries(selection)
          .filter(([_, selected]) => selected === true)
          .map(([field]) => `entity.${field}`);
        queryBuilder.select(selectedFields);
      }
    } else {
      queryBuilder.select('entity');
    }

    const getNestedSelection = (path: string, selectionObj: any): any => {
      const parts = path.split('.');
      let current = selectionObj;
      for (const part of parts) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[part];
      }
      return current;
    };

    const applyRelation = (relation: string, relationSelection?: any): void => {
      const relationParts = relation.split('.');
      let alias = 'entity';
      let fullPath = '';

      relationParts.forEach((part, index) => {
        fullPath += (fullPath ? '.' : '') + part;
        if (!joinedRelations.has(fullPath)) {
          const newAlias = fullPath.replace(/\./g, '_');
          const propertyPath = `${alias}.${part}`;

          // For the last part of the relation path, handle selection
          if (index === relationParts.length - 1) {
            if (relationSelection) {
              // If selection is specified for this relation, select only those fields
              if (Array.isArray(relationSelection)) {
                queryBuilder
                  .leftJoin(propertyPath, newAlias)
                  .addSelect(
                    relationSelection.map(
                      (field) => `${newAlias}.${String(field)}`,
                    ),
                  );
              } else {
                const selectedFields = Object.entries(relationSelection)
                  .filter(([_, selected]) => selected === true)
                  .map(([field]) => `${newAlias}.${field}`);
                queryBuilder
                  .leftJoin(propertyPath, newAlias)
                  .addSelect(selectedFields);
              }
            } else {
              // If no selection specified, select all fields
              queryBuilder.leftJoinAndSelect(propertyPath, newAlias);
            }
          } else {
            // For intermediate relations, just join without selection
            queryBuilder.leftJoin(propertyPath, newAlias);
          }
          joinedRelations.add(fullPath);
        }
        alias = fullPath.replace(/\./g, '_');
      });
    };

    if (Array.isArray(relations)) {
      relations.forEach((relation) => {
        // Get nested selection for this relation path
        const relationSelection =
          selection && typeof selection === 'object'
            ? getNestedSelection(relation, selection)
            : undefined;
        applyRelation(relation, relationSelection);
      });
    } else if (typeof relations === 'object') {
      Object.entries(relations).forEach(([relation, relationSelection]) => {
        applyRelation(relation, relationSelection);
      });
    }
  }

  private applySelectRevamped(
    queryBuilder: SelectQueryBuilder<Entity>,
    select: FindOneOptions<Entity>['select'],
    parentAlias: string,
  ): void {
    if (!select) return;

    if (Array.isArray(select)) {
      queryBuilder.addSelect(
        select.map((field) => `${parentAlias}.${String(field)}`),
      );
    } else {
      const selectedFields = Object.entries(select)
        .filter(([_, selected]) => selected === true)
        .map(([field]) => `${parentAlias}.${field}`);
      queryBuilder.addSelect(selectedFields);
    }
  }

  private applyOrderBy(
    queryBuilder: SelectQueryBuilder<Entity>,
    order: FindOptionsOrder<Entity>,
    prefix = 'entity',
  ): void {
    for (const [key, value] of Object.entries(order)) {
      if (typeof value === 'object' && value !== null) {
        // Get the alias for the relation
        const relationName = `${prefix === 'entity' ? '' : prefix + '_'}${key}`;
        this.applyOrderBy(queryBuilder, value, relationName);
      } else if (
        typeof value === 'string' &&
        (value === 'ASC' || value === 'DESC')
      ) {
        queryBuilder.addOrderBy(`${prefix}.${key}`, value);
      }
    }
  }

  // private applySelectRevamped(
  //   queryBuilder: SelectQueryBuilder<any>,
  //   select: any,
  //   parentAlias: string,
  // ) {
  //   for (const [key, value] of Object.entries(select)) {
  //     if (value === true) {
  //       queryBuilder.addSelect(`${parentAlias}.${key}`);
  //     }
  //   }
  // }

  private applySearch(
    queryBuilder: SelectQueryBuilder<Entity>,
    searchTerm: string,
    searchFields: string[],
  ): void {
    const searchConditions = searchFields
      .map((field) => {
        const fieldParts = field.split('.');
        const alias = fieldParts.slice(0, -1).join('_') || 'entity';
        const lastPart = fieldParts[fieldParts.length - 1];

        // Special case for fullName search
        if (lastPart === 'fullName') {
          return `CONCAT_WS(' ', ${alias}.firstName, ${alias}.lastName) ILIKE :searchTerm`;
        }

        // Special case for fullName search with prefix
        if (lastPart && lastPart.includes('FullName')) {
          const prefix = lastPart.split('FullName')[0];
          return `CONCAT_WS(' ', ${alias}.${prefix}FirstName, ${alias}.${prefix}LastName) ILIKE :searchTerm`;
        }

        return `${alias}.${lastPart} ILIKE :searchTerm`;
      })
      .join(' OR ');

    queryBuilder.andWhere(`(${searchConditions})`, {
      searchTerm: `%${searchTerm}%`,
    });
  }

  private applyDateRange(
    queryBuilder: SelectQueryBuilder<Entity>,
    fromDate: Date,
    toDate: Date,
  ): void {
    if (toDate) {
      toDate.setHours(23, 59, 59, 0);
    }
    queryBuilder.andWhere('entity.createdAt BETWEEN :fromDate AND :toDate', {
      fromDate,
      toDate,
    });
  }

  private async executePaginatedQuery(
    queryBuilder: SelectQueryBuilder<Entity>,
    paginationOptions: PaginationOptions,
    countQueryBuilder: SelectQueryBuilder<Entity>,
  ): Promise<Pagination<Entity, IPaginationMeta>> {
    const result = await countQueryBuilder.getRawOne<{ count: number }>();
    const totalItems = result!.count;

    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const items = await queryBuilder.getMany();

    const itemCount = items.length;
    const totalPages = Math.ceil(totalItems / limit);

    const meta: IPaginationMeta = {
      itemCount,
      totalItems,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    };

    return {
      items,
      meta,
    };
  }

  private applyDefaultFilters(
    condition: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[] {
    const defaultFilters = {
      enable: true,
      deleted: false,
    };
    if (Array.isArray(condition)) {
      return condition.map((c) => ({ ...c, ...defaultFilters }));
    }
    return {
      ...defaultFilters,
      ...condition,
    };
  }
}
