import {
  Model,
  UpdateQuery,
  QueryOptions,
  SaveOptions,
  Types,
  QueryFilter,
  AnyKeys,
  AnyObject,
} from 'mongoose';

export interface IPaginate {
  page: number;
  limit?: number;
}

export type finderOneArg<TDocument> = {
  filter?: QueryFilter<TDocument>;
  populate?: any;
  select?: string;
  options?: QueryOptions<TDocument>;
  companyId?: Types.ObjectId; // 🚀 [SaaS] معرف الشركة لضمان عزل البيانات
};

export type findersArg<TDocument> = finderOneArg<TDocument> & {
  paginate?: IPaginate;
  sort?: any;
};

export type updateArgs<TDocument> = {
  filter: QueryFilter<TDocument>;
  update: UpdateQuery<TDocument>;
  populate?: any;
  select?: string;
  options?: QueryOptions<TDocument>;
  companyId?: Types.ObjectId; // 🚀 [SaaS] معرف الشركة
};

export abstract class AbstractRepository<TDocument> {
  protected constructor(public readonly model: Model<TDocument>) {}

  // ==========================================
  // 🛡️ SaaS Security Engine: Inject Company ID
  // ==========================================
  private applyTenantFilter(
    filter: QueryFilter<TDocument>,
    companyId?: Types.ObjectId,
  ): QueryFilter<TDocument> {
    if (companyId) {
      return { ...filter, company_id: companyId };
    }
    return filter;
  }

  async findAll({
    filter = {},
    populate,
    select,
    paginate,
    sort,
    options,
    companyId,
  }: findersArg<TDocument>): Promise<any> {
    const tenantFilter = this.applyTenantFilter(filter, companyId);

    let query = this.model.find(tenantFilter, null, options);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (sort) query = query.sort(sort);

    const page = paginate?.page ? paginate.page : 1;
    const limit = paginate?.limit ? paginate.limit : 10;
    const skip = (page - 1) * limit;

    const totalSize = await query.model.countDocuments(query.getQuery() as any);
    const data = await query.skip(skip).limit(limit).exec();

    return {
      totalSize,
      totalPages: Math.ceil(totalSize / limit),
      pageSize: data.length,
      pageNumber: page,
      data,
    };
  }

  async findOne({
    filter = {},
    populate,
    select,
    options,
    companyId,
  }: finderOneArg<TDocument>): Promise<TDocument | null> {
    const tenantFilter = this.applyTenantFilter(filter, companyId);
    let query = this.model.findOne(tenantFilter, null, options);

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.exec();
  }

  async create(
    document: AnyKeys<TDocument> & AnyObject,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const doc = new this.model(document);
    const savedDoc = await doc.save(options);
    return savedDoc as unknown as TDocument;
  }

  async update({
    filter,
    update,
    populate,
    select,
    options,
    companyId,
  }: updateArgs<TDocument>): Promise<TDocument | null> {
    const tenantFilter = this.applyTenantFilter(filter, companyId);
    let query = this.model.findOneAndUpdate(tenantFilter, update, {
      returnDocument: 'after',
      runValidators: true,
      ...options,
    });

    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.exec();
  }

  async delete(
    filter: QueryFilter<TDocument>,
    options?: QueryOptions<TDocument>,
    companyId?: Types.ObjectId,
  ): Promise<TDocument | null> {
    const tenantFilter = this.applyTenantFilter(filter, companyId);
    let query = this.model.findOneAndDelete(tenantFilter, options);
    return query.exec();
  }

  // أضف هذه الدالة داخل الـ AbstractRepository
  get modelInstance() {
    return this.model;
  }
}
