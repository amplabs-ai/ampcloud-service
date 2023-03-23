from app.archive_constants import ENV

FILTER_DASHBOARD = """
SELECT 
  active_mass,
  ah,
  anode,
  cathode,
  cell_metadata.cell_id,
  form_factor,
  cell_metadata.index,
  test,
  tester
FROM cell_metadata 
JOIN 
  {table}
  ON 
    cell_metadata.cell_id = {table}.cell_id AND 
    cell_metadata.email = {table}.email
WHERE 
  cell_metadata.email IN ('{email}') AND 
  is_public IS {is_public} AND
  test = '{test}' {filters}
ORDER BY
  CASE
    WHEN cell_metadata.cell_id LIKE 'training_cell_%' 
    then CAST(substring(cell_metadata.cell_id,15) AS int) 
  end,
  CASE 
    WHEN cell_metadata.email LIKE 'info%' 
    THEN cell_metadata.index 
  end DESC
"""


CAPACITY_QUERY = """
with temp as 
  (SELECT
    r.cell_id,
    r.cycle_index,
    case 
      when r.active_mass is null
        or r.active_mass = 0 
    then 
      CAST(cycle_charge_capacity as double precision) * 1000000 
    else 
      (CAST(cycle_charge_capacity as double precision) / r.active_mass) * 1000000 
    end 
      cycle_charge_capacity,
    case 
      when r.active_mass is null
        or r.active_mass = 0 
    then 
      CAST(cycle_discharge_capacity as double precision) * 1000000 
    else 
      (CAST(cycle_discharge_capacity as double precision) / r.active_mass) * 1000000 
    end 
      cycle_discharge_capacity
  FROM (
    SELECT 
      cycle_stats.cell_id, 
      active_mass,
      trunc(cycle_index,0) as cycle_index, 
      cycle_charge_capacity, 
      cycle_discharge_capacity
    FROM 
      cycle_stats
    JOIN 
      cell_metadata 
    ON 
      cycle_stats.cell_id = cell_metadata.cell_id AND 
      cycle_stats.email = cell_metadata.email
    WHERE 
      cycle_stats.cell_id IN {cell_id} and 
      (cycle_stats.email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
        or 
        cycle_stats.email in (select distinct email 
                                from cell_metadata 
                                where is_public='true'
                              )
      )
    {filters}
  ) as r
)
(select 
  cell_id,
  cell_id || ', ' || 'charge' as series,
  cycle_index, 
  cycle_charge_capacity as value from temp
union
select 
  cell_id,
  cell_id || ', ' || 'discharge' as series,
  cycle_index, 
  cycle_discharge_capacity as value from temp
)
order by 
  cell_id, 
  cycle_index, 
  series;
"""


OPERATING_POTENTIAL_QUERY = """
with temp as
  (
    SELECT 
      r.cell_id, 
      r.cycle_index,
      cycle_mean_charge_voltage,
      cycle_mean_discharge_voltage
    FROM (
      SELECT 
        cell_id,
        trunc(cycle_index::numeric,0) as cycle_index,
        cycle_mean_charge_voltage,
        cycle_mean_discharge_voltage
      FROM
        cycle_stats
      WHERE 
        cell_id IN {cell_id} and 
        (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
          or email in (select distinct email 
                      from cell_metadata 
                      where is_public='true'
                    )
        ) {filters}
    ) as r
  )
(
  select 
    cell_id,
    cell_id || ', ' || 'charge' as series,
    cycle_index,
    cycle_mean_charge_voltage as value from temp
  union
  select 
    cell_id,
    cell_id || ', ' || 'discharge' as series,
    cycle_index,
    cycle_mean_discharge_voltage as value from temp
)
order by 
  cell_id, 
  cycle_index, 
  series;
"""


GALVANOSTATIC_QUERY = """
select
    cell_id,
    series,
    v,
    case 
      when 
        foo.active_mass is null or 
        foo.active_mass = 0 
      then ah 
      else 
        (ah / foo.active_mass) * 1000000 
      end specific_capacity
  from (
    SELECT
      cycle_timeseries_new.cell_id,
      cycle_index,
      test_time,
      voltage as v,
      active_mass,
      case 
        when current > 0 
          then charge_capacity 
        when current < 0 
          then discharge_capacity 
        end ah,
      case 
        when current > 0 
          then cycle_timeseries_new.cell_id || ' Cycle ' || cycle_index || ', charge' 
        when current < 0 
          then cycle_timeseries_new.cell_id || ' Cycle ' || cycle_index || ', discharge' 
        end series
    FROM (
      select
        email,
        cell_id,
        voltage,
        charge_capacity,
        discharge_capacity,
        current,
        cycle_index,
        test_time
      from cycle_timeseries
      where
        cell_id IN {cell_id}
        and ( email in ('{email}','info@batteryarchive.org','data.matr.io@tri.global')
            or email in (select distinct email
                        from cell_metadata
                        where is_public = 'true'
                        )
            ) {filters}
      ) cycle_timeseries_new
    inner join 
      cell_metadata 
      on 
      cycle_timeseries_new.cell_id = cell_metadata.cell_id
        and cycle_timeseries_new.email = cell_metadata.email
  ) as foo
  where
    foo.series is not null
  order by
    foo.cell_id,
    foo.cycle_index,
    foo.test_time
"""


ENERGY_DENSITY_QUERY = """
with temp as
(
  SELECT 
    r.cell_id, 
    r.cycle_index,
    cycle_charge_energy_density,
    cycle_discharge_energy_density
  FROM (
    SELECT 
      cell_id,
      trunc(cycle_index::numeric,0) as cycle_index,
      cycle_charge_energy_density,
      cycle_discharge_energy_density
    FROM 
      cycle_stats
    WHERE 
      cell_id IN {cell_id} and 
      (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
        or email in (select distinct email 
                    from cell_metadata 
                    where is_public='true'
                  )
      ) {filters}
  ) as r
)
(
  select
    cell_id,
    cell_id || ', ' || 'charge' as series,
    cycle_index,
    cycle_charge_energy_density as value from temp
  union
  select
    cell_id,
    cell_id || ', ' || 'discharge' as series,
    cycle_index,
    cycle_discharge_energy_density as energy_density from temp
)
order by 
  cell_id, 
  cycle_index, 
  series;
"""


DIFFERENTIAL_CAPACITY_QUERY="""
  SELECT
    cell_id,
    charge_capacity,
    discharge_capacity,
    current,
    voltage,
    cell_id || ' Cycle ' || cycle_index as series
  FROM cycle_timeseries
  where 
    cell_id IN {cell_id} 
    and (email in 
          ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or 
          email in ( select distinct email 
                    from cell_metadata 
                    where is_public='true')
          ) {filters}
  order by 
    cell_id, 
    test_datapoint_ordinal
"""


VOLTAGE_TIME_QUERY="""
SELECT
  cell_id,
  voltage,
  test_time
FROM cycle_timeseries
where 
  cell_id IN {cell_id} and 
  (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
  or email in (select distinct email 
              from cell_metadata 
              where is_public='true'
              )
  ) {filters}
order by 
  cell_id, 
  test_datapoint_ordinal
"""


CURRENT_TIME_QUERY="""
SELECT
  cell_id,
  current,
  test_time
FROM cycle_timeseries
where 
  cell_id IN {cell_id} and 
  (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
    or email in (select distinct email 
                  from cell_metadata 
                  where is_public='true'
                )
  ) {filters}
order by 
  cell_id, 
  test_datapoint_ordinal
"""


COULOMBIC_EFFICIENCY_QUERY = """
SELECT 
    cell_id, 
    trunc(cycle_index,0) as cycle_index, 
    cycle_coulombic_efficiency as value
  FROM 
    cycle_stats
  WHERE 
    cell_id IN {cell_id} and 
    (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or 
      email in (select distinct email 
                from cell_metadata 
                where is_public='true'
                )
    ) {filters}
order by
  cell_id,
  cycle_index
"""

ABUSE_TEST_TEMPRATURES="""
with temp as
(
  SELECT 
    r.cell_id,
    r.test_time,
    below_punch_temperature,
    above_punch_temperature,
    left_bottom_temperature,
    right_bottom_temperature,
    pos_terminal_temperature,
    neg_terminal_temperature
  FROM (
    SELECT 
      cell_id,
      test_time,
      below_punch_temperature,
      above_punch_temperature,
      left_bottom_temperature,
      right_bottom_temperature,
      pos_terminal_temperature,
      neg_terminal_temperature
    FROM
      abuse_timeseries
    WHERE 
        cell_id IN {cell_id} and 
        (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
          or email in (select distinct email 
                      from cell_metadata 
                      where is_public='true'
                    )
        ) {filters}
    ) as r
)
(
  SELECT
    cell_id,
    cell_id || ', ' || 'BPT' as series_1,
    test_time,
    below_punch_temperature AS value
  FROM temp
  WHERE value <> '0'
  UNION
  SELECT
    cell_id,
    cell_id || ', ' || 'APT' as series_1,
    test_time,
    above_punch_temperature AS value
  FROM temp
  WHERE value <> '0'
  UNION
  SELECT
    cell_id,
    cell_id || ', ' || 'LBT' as series_1,
    test_time,
    left_bottom_temperature AS value
  FROM temp
  WHERE value <> '0'
  UNION
  SELECT
    cell_id,
    cell_id || ', ' || 'RBT' as series_1,
    test_time,
    right_bottom_temperature AS value
  FROM temp
  WHERE value <> '0'
  UNION
  SELECT
    cell_id,
    cell_id || ', ' || 'PTT' as series_1,
    test_time,
    pos_terminal_temperature AS value
  FROM temp
  WHERE value <> '0'
  UNION
  SELECT
    cell_id,
    cell_id || ', ' || 'NTT' as series_1,
    test_time,
    neg_terminal_temperature AS value
  FROM temp
  WHERE value <> '0'
)
ORDER BY 
  cell_id,
  test_time,
  series_1;
"""


ABUSE_FORCE_AND_DISPLACEMENT="""
with temp as
(
  SELECT 
    r.cell_id,
    r.test_time,
    axial_f,
    axial_d
  FROM (
    SELECT 
      abuse_timeseries.cell_id,
      test_time,
      axial_f,
      axial_d
    FROM
      abuse_timeseries 
    WHERE 
      cell_id IN {cell_id}  and 
      (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
        or email in (select distinct email 
                    from cell_metadata 
                    where is_public='true'
                  )
      ){filters}
  ) AS r
)
(
  SELECT 
    cell_id, 
    cell_id || ',' || 'F' as series,
    test_time,
    axial_f as value 
  FROM 
    temp
  WHERE
    value <> '0'
  UNION
  SELECT 
    cell_id, 
    cell_id || ',' || 'D' as series,
    test_time,
    axial_d as value 
  FROM 
    temp
  WHERE
    value <> '0'
)
ORDER BY 
  cell_id,
  test_time,
  series;
"""


ABUSE_VOLTAGE="""
SELECT 
  cell_id,
  cell_id || ', ' || 'v' as series,
  test_time,
  v as value
  FROM 
    abuse_timeseries
  WHERE 
    cell_id IN {cell_id}  and 
    (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
      or email in (select distinct email 
                  from cell_metadata 
                  where is_public='true'
                )
    ) and
    value <> '0' {filters} 
ORDER BY 
  cell_id,
  test_time,
  series;
"""


TIMESERIES_DATA="""
SELECT 
  {columns}, 
  cell_id
FROM
  {table}
WHERE 
  cell_id IN ({cell_ids}) and 
  MOD(index, 5)=0 and 
  (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') 
  ) {filters} 
order by 
  {order}
"""


STATS_DATA="""
SELECT 
  {columns}, 
  cell_id
FROM
  cycle_stats
WHERE 
  cell_id IN ({cell_ids}) and 
  (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global') or 
  email in (select distinct email 
            from cell_metadata 
            where is_public='true'
            )
  ) {filters} 
order by 
  cell_id, 
  cycle_index
"""


COUNT_CATHODE_FILES = """
  SELECT 
    count(index), 
    cathode
  FROM cell_metadata 
  WHERE 
    (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global')) and 
    cathode is NOT NULL and
    cathode != ''
  GROUP BY 
    cathode
"""

COUNT_FORM_FACTOR = """
    SELECT 
      count(index), 
      form_factor
    FROM cell_metadata
    WHERE 
      (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global')) and 
      form_factor is NOT NULL and
      form_factor != ''
    GROUP BY 
      form_factor
"""


CELL_IDS = """
  SELECT 
    COUNT(index)
  FROM cell_metadata
  WHERE 
    (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global'))
"""


TOTAL_CYCLE_INDEX = """
  SELECT 
    COUNT(cycle_index)
  FROM CYCLE_STATS 
  WHERE 
    (email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global'))
"""


SIZE_CELL_METADATA = """
  select size from SVV_TABLE_INFO where "table" = 'cell_metadata'
""" if ENV == "production" else """select pg_relation_size('cell_metadata') as size"""


SIZE_CYCLE_STATS = """
  select size from SVV_TABLE_INFO where "table" = 'cycle_stats'
""" if ENV == "production" else """select pg_relation_size('cycle_stats') as size"""


SIZE_CYCLE_TIMESERIES = """
  select size from SVV_TABLE_INFO where "table" = 'cycle_timeseries'
""" if ENV == "production" else """select pg_relation_size('cycle_timeseries') as size"""


ANODE_FILTER_QUERY = """
  select 
    DISTINCT(anode) as Anode
  from 
    cell_metadata 
  where 
    anode is not NULL and 
    anode != '' and 
    email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global');
"""


CATHODE_FILTER_QUERY = """
  select 
    DISTINCT(cathode) as Cathode
  from 
    cell_metadata 
  where  
    cathode is not NULL and 
    cathode != '' and 
    email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global');
"""


AH_FILTER_QUERY = """
  select 
    MAX(ah) as max_capacity,
    MIN(ah) as min_capacity
  from 
    cell_metadata 
  where 
    email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global');
"""


FORMAT_SHAPE_FILTER_QUERY = """
  select 
    DISTINCT(form_factor) as Format_shape
  from 
    cell_metadata 
  where 
    form_factor is not NULL and 
    form_factor != '' and 
    email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global');
"""


TEST_TYPE_FILTER_QUERY = """
  select 
    DISTINCT(test) as Type_of_test
  from 
    cell_metadata 
  where 
    test is not NULL and 
    test != '' and 
    email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global');
"""


TEMPERATURE_FILTER_QUERY = """
  select 
    MAX(temperature) as max_temp,
    MIN(temperature) as min_temp 
  FROM 
    cycle_metadata
  where 
    email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global');
"""


RATE_FILTER_QUERY = """
  select 
    MAX(crate_c) as max_charge_rate,
    MIN(crate_c) as min_charge_rate,
    MAX(crate_d) as max_discharge_rate,
    MIN(crate_d) as min_discharge_rate
  from 
    cycle_metadata 
  where 
    email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global');
"""


VOLTAGE_FILTER_QUERY = """
  select MAX(v_max) as max_op_v,
  MIN(v_min) as min_op_v
  from cycle_metadata where email in ('{email}', 'info@batteryarchive.org', 'data.matr.io@tri.global');
"""

COPY_S3_TO_REDSHIFT = """
COPY {database}.{schema}.{table}({columns}) FROM 's3://{bucket}/{file_path}' IAM_ROLE '{iam_role}' FORMAT AS CSV DELIMITER ',' QUOTE '"' IGNOREHEADER 1 BLANKSASNULL EMPTYASNULL IGNOREBLANKLINES REGION AS '{region}';commit;
"""