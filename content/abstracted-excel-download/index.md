---
emoji: 📖
title: 아 엑셀다운로드 개발,,, 쉽고 빠르게 하고 싶다 (feat. 엑셀 다운로드 모듈 개발기)
date: '2025-01-06 20:30:15'
author: 에디
categories: aop
---

## 아 엑셀다운로드 개발,,, 쉽고 빠르게 하고 싶다 (feat. 엑셀 다운로드 모듈 개발기)

## 📌 들어가며

여러분도 한 번쯤은 대량의 데이터를 엑셀로 뽑아야 하는 순간을 맞이해본 적 있죠?
“이거 또 반복 작업인가…” 하며 한숨이 절로 나오는 그 기분!
저는 이 귀찮음을 단축시키고, 더 깔끔한 코드를 남기고 싶어서 엑셀 다운로드 모듈을 직접 만들어 보기로 했습니다.
비슷한 불편을 겪고 계신 분들께 작은 힌트라도 되길 바라며, 재미있게 풀어볼게요!

### 왜 엑셀 다운로드 모듈을 만들게 되었나?
    - 중복 코드의 지옥
    매번 컨트롤러마다 Workbook, Sheet, CellStyle을 일일이 세팅하다 보니, 어느새 코드가 사방팔방 흩어져 버렸습니다.
	- 요구사항 변경의 파도:
    - “이번엔 헤더 색깔 좀 바꿔주세요.” “셀 병합도 좀 해주세요.”
작은 요구 하나가 생길 때마다 장문의 코드를 읽어야 하니 답답했습니다.

“한 번만 만들어 놓고 계속 써먹자!”
이 간절함이 모듈 개발의 출발점이었습니다.

### 아주 많은 엑셀 다운로드
PG사의 백오피스에서는 가맹점 혹은 회계팀, 재무팀 등에서
거래 목록, 매입 목록, 정산 목록 등등 총 50개가 넘는 엑셀 다운로드 기능이 존재했습니다.

![엑셀](https://techblog.woowahan.com/wp-content/uploads/img/2020-10-08/a-lot-of-excels.png)

그리고 데이터의 양은 심하면 30만 Row 혹은 그 이상의 데이터들을 엑셀에 넣어줘야 했습니다.

현재와 같은 엑셀 개발 방법으로는 생산성이 다소 떨어진다고 판단하였습니다.

그리하여 엑셀 다운로드 기능 개발의 생산성을 올려줄 간단한 모듈을 만들어야겠다고 생각했는데요, 기존에는 엑셀 다운로드 개발 기능을 어떻게 구현하고 있었는지 가장 기본적인 형태부터 소개해보도록 하겠습니다.

## 초기 버전(POI를 이용한 엑셀 다운로드 개발)

```java
@GetMapping("/api/v1/car")
public void downloadCarInfo(HttpServletResponse response) throws IOException {
  // 데이터를 가져오고 Workbook, Sheet를 만듭니다
  CellStyle greyCellStyle = workbook.createCellStyle();
  applyCellStyle(greyCellStyle, new Color(231, 234, 236));

  CellStyle blueCellStyle = workbook.createCellStyle();
  applyCellStyle(blueCellStyle, new Color(223, 235, 246));

  CellStyle bodyCellStyle = workbook.createCellStyle();
  applyCellStyle(bodyCellStyle, new Color(255, 255, 255));

  // 헤더를 생성합니다
  int rowIndex = 0;
  Row headerRow = sheet.createRow(rowIndex++);
  Cell headerCell1 = headerRow.createCell(0);
  headerCell1.setCellValue("회사");
  headerCell1.setCellStyle(greyCellStyle); // style을 지정해주는 코드 추가

  /* 나머지 헤더 렌더링을 위한 반복 생략 */

  // 바디에 데이터를 넣어줍니다
  for (CarExcelDto dto : carExcelDtos) {
    Row bodyRow = sheet.createRow(rowIndex++);

    Cell bodyCell1 = bodyRow.createCell(0);
    bodyCell1.setCellValue(dto.getCompany());
    bodyCell1.setCellStyle(bodyCellStyle);

    /**
     * 나머지 바디 렌더링을 위한 반복 생략 
     * int 타입과 double 타입에 대한 DataFormat 설정이 추가적으로 있습니다
     */ 
  }

  // OutputStream에 엑셀 sheet 데이터 쓰기
}

private void applyCellStyle(CellStyle cellStyle, Color color) {
  XSSFCellStyle xssfCellStyle = (XSSFCellStyle) cellStyle;
  xssfCellStyle.setFillForegroundColor(new XSSFColor(color, new DefaultIndexedColorMap()));
  cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
  cellStyle.setAlignment(HorizontalAlignment.CENTER);
  cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
  cellStyle.setBorderLeft(BorderStyle.THIN);
  cellStyle.setBorderTop(BorderStyle.THIN);
  cellStyle.setBorderRight(BorderStyle.THIN);
  cellStyle.setBorderBottom(BorderStyle.THIN);
}
```

![엑셀2](https://techblog.woowahan.com/wp-content/uploads/img/2020-10-08/excel-example-2.png)

새로운 엑셀 다운로드 기능을 구현할때마다 이런 코드가 반복된다고 생각하니 끔찍합니다… 으…

## 새로운 엑셀모듈 개발하기

- 수십만 건의 대용량 데이터 처리
- 다중 시트와 시트별 다른 시작 위치
- 코드값 변환, 날짜 포맷 등 복잡한 데이터 변환
- 필수값 검증 및 에러 처리
- 다국어 지원 및 일관된 기업 스타일 적용

### 어노테이션과 리플렉션을 이용하여 간편하게!
첫 번째 목표는 Column에 getter를 사용해 Cell을 하나씩 만들어줄 필요가 없도록 하는 것입니다. 이 목표를 위해 JAVA에 존재하는 어노테이션과 리플렉션을 활용할 수 있습니다.

제가 구상한 방법은, JPA에서 DB column을 @Column으로 표시하는 것과 비슷하게 DTO에서 엑셀에 표시하고 싶은 필드를 @ExcelColum 으로 표시하는 방법입니다.

## 1. 왜 '단순 AOP'만으로는 부족할까?
단일 시트, 소량 데이터에 대해서는 간단한 `@ExcelDocument` 애노테이션 기반 AOP 처리가 충분할 수 있습니다. 하지만 실제 서비스 환경에서는 이보다 훨씬 복잡한 요구사항이 존재합니다.

- **대용량 데이터**: 100만 건 이상의 데이터를 처리해야 할 때 메모리 사용량 문제
- **다중 시트**: 보고서마다 여러 개의 시트, 각 시트마다 서로 다른 DTO 매핑 필요
- **데이터 변환**: 필드 값에 따라 코드→문구 변환, 커스텀 날짜 포맷 등 로직 필요
- **데이터 검증**: 특정 컬럼이 비어 있으면 에러를 발생시키는 검증 로직 필요
- **다국어 지원**: 헤더 텍스트를 사용자의 Locale에 따라 변경해야 함
- **표준 스타일링**: 회사 기본 스타일(폰트·테두리·컬러)을 전역 설정으로 관리

이러한 요구사항을 단일 AOP 어드바이스로 묶어 처리하면, 코드가 복잡해지고 유지보수가 어려워집니다. 따라서 모듈화, 플러그인 아키텍처, 스트리밍 엔진 등을 포함한 확장 가능한 설계가 필요합니다.

## 2. 아키텍처 개요

```
┌────────────────────────────────────────────────────────┐
│                   ExcelStarter                         │
│  (Spring Boot Auto‑Configuration + application.yml)    │
├───────────────┬─────────────┬──────────────┬───────────┤
│    Core       │  Streaming  │  Plugin      │  i18n     │
│  - Annotation │  Engine     │  - Converter │ Resolver  │
│  - Builder    │ SXSSF 기반   │  - Validator │           │
│  - Metadata   │             │  - Formatter │           │
└───────────────┴─────────────┴──────────────┴───────────┘
```

### 2.1. Core 모듈
- @ExcelDocument, @SheetConfig 등 애노테이션 정의
- ExcelBuilder API, AOP 지원
- DTO 메타데이터 추출·관리

### 2.2. Streaming Engine
- Apache POI의 SXSSFWorkbook 기반으로 메모리에 상위 100행만 유지

### 2.3. Plugin 모듈
- ValueConverter: 특정 필드 값 변환 (예: 코드→텍스트)
- Validator: DTO 필수값·포맷 검증
- Formatter: 사용자 정의 포맷 적용 (예: 전화번호, 우편번호)

### 2.4. i18n & Global Config
- messages_{locale}.properties 파일에서 헤더 텍스트 조회
- application.yml로 기본 스타일·엔진 타입·템포럴 포맷 지정

## 3. Core 모듈 – 애노테이션과 Builder

### 3.1. 애노테이션 확장

```java
/**
 * 엑셀 문서를 정의하는 최상위 애노테이션
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelDocument {
    /**
     * 다운로드할 엑셀 파일명
     */
    String fileName();
    
    /**
     * 문서 내 시트 구성 정보
     */
    SheetConfig[] sheets() default {};
    
    /**
     * 템플릿 파일 경로 (선택 사항)
     * 템플릿 미지정 시 빈 문서에서 시작
     */
    String template() default "";
}

/**
 * 시트별 설정 정보
 */
@Target({})
@Retention(RetentionPolicy.RUNTIME)
public @interface SheetConfig {
    /**
     * 시트명
     */
    String name();
    
    /**
     * 매핑할 DTO 클래스
     */
    Class<?> dto();
    
    /**
     * 시트별 개별 템플릿(선택)
     * 시트별로 서로 다른 템플릿 적용 가능
     */
    String template() default "";
    
    /**
     * 헤더 시작 위치 (기본값: A2)
     */
    String startCell() default "A2";
    
    /**
     * 데이터 행 시작 위치 (기본값: startCell 기준 +1)
     */
    String dataStartCell() default "";
}

/**
 * DTO 필드에 적용하는 컬럼 매핑 애노테이션
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelColumn {
    /**
     * 컬럼 순서 (0부터 시작)
     */
    int order();
    
    /**
     * 헤더 텍스트 (직접 지정 시)
     */
    String header() default "";
    
    /**
     * 다국어 리소스 키 (messages.properties)
     */
    String headerKey() default "";
    
    /**
     * 컬럼 너비 (기본값 -1: 자동)
     */
    int width() default -1;
    
    /**
     * 셀 스타일 (헤더)
     */
    ExcelCellStyle headerStyle() default @ExcelCellStyle;
    
    /**
     * 셀 스타일 (데이터)
     */
    ExcelCellStyle dataStyle() default @ExcelCellStyle;
}

/**
 * 셀 스타일 정의
 */
@Target({})
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelCellStyle {
    /**
     * 폰트 이름
     */
    String fontName() default "";
    
    /**
     * 폰트 크기
     */
    short fontSize() default -1;
    
    /**
     * 폰트 색상 (e.g., "#FF0000")
     */
    String fontColor() default "";
    
    /**
     * 배경 색상 (e.g., "#FFFFCC")
     */
    String bgColor() default "";
    
    /**
     * 굵게
     */
    boolean bold() default false;
    
    /**
     * 가로 정렬
     */
    HAlign hAlign() default HAlign.DEFAULT;
    
    /**
     * 세로 정렬
     */
    VAlign vAlign() default VAlign.DEFAULT;
    
    /**
     * 테두리 (전체)
     */
    BorderStyle border() default BorderStyle.DEFAULT;
    
    /**
     * 자동 줄바꿈
     */
    boolean wrapText() default false;
    
    enum HAlign { DEFAULT, LEFT, CENTER, RIGHT }
    enum VAlign { DEFAULT, TOP, MIDDLE, BOTTOM }
    enum BorderStyle { DEFAULT, NONE, THIN, MEDIUM, THICK }
}
```

이 애노테이션 세트는 다음과 같은 기능을 제공합니다:

- `@ExcelDocument.sheets`로 다중 시트 정의
- 시트별 `template`을 지정해 템플릿 혼합 사용
- `startCell`로 헤더 위치 자유롭게 지정
- 컬럼별 스타일, 너비, 다국어 리소스 키 등 설정 가능

### 3.2. Builder API

```java
/**
 * 엑셀 문서 생성을 위한 빌더 인터페이스
 */
public interface ExcelBuilder {
    /**
     * 빌더 인스턴스 생성
     */
    static ExcelBuilder create() {
        return new ExcelBuilderImpl();
    }

    /**
     * 엑셀 문서 클래스 지정
     */
    ExcelBuilder document(Class<?> docClass);
    
    /**
     * 시트별 데이터 추가
     */
    ExcelBuilder sheetData(String sheetName, List<?> data);
    
    /**
     * 다국어 Locale 설정
     */
    ExcelBuilder locale(Locale locale);
    
    /**
     * 값 변환기 추가 (단일)
     */
    ExcelBuilder addConverter(ValueConverter converter);
    
    /**
     * 값 변환기 추가 (다중)
     */
    ExcelBuilder addConverters(Collection<ValueConverter> converters);
    
    /**
     * 값 변환기 추가 (가변 인자)
     */
    ExcelBuilder addConverters(ValueConverter... converters);
    
    /**
     * 검증기 추가 (단일)
     */
    ExcelBuilder addValidator(Validator validator);
    
    /**
     * 검증기 추가 (다중)
     */
    ExcelBuilder addValidators(Collection<Validator> validators);
    
    /**
     * 검증기 추가 (가변 인자)
     */
    ExcelBuilder addValidators(Validator... validators);
    
    /**
     * 커스텀 셀 스타일 추가
     */
    ExcelBuilder addCellStyle(String name, CellStyle style);
    
    /**
     * i18n 리졸버 설정
     */
    ExcelBuilder i18nResolver(I18nResolver resolver);
    
    /**
     * 문서 작성 및 출력
     */
    void write(OutputStream os) throws IOException;
}

/**
 * ExcelBuilder 구현체
 */
public class ExcelBuilderImpl implements ExcelBuilder {
    private Class<?> documentClass;
    private Map<String, List<?>> sheetDataMap = new HashMap<>();
    private Locale locale = Locale.getDefault();
    private List<ValueConverter> converters = new ArrayList<>();
    private List<Validator> validators = new ArrayList<>();
    private Map<String, CellStyle> namedStyles = new HashMap<>();
    private I18nResolver i18nResolver;
    private ExcelEngine engine;
    
    public ExcelBuilderImpl() {
        // 기본 설정에서 엔진 타입 결정
        this.engine = determineEngine();
    }
    
    private ExcelEngine determineEngine() {
        // application.yml 설정에 따라 스트리밍 또는 인메모리 엔진 선택
        return ExcelEngineFactory.create();
    }
    
    @Override
    public ExcelBuilder document(Class<?> docClass) {
        this.documentClass = docClass;
        return this;
    }
    
    @Override
    public ExcelBuilder sheetData(String sheetName, List<?> data) {
        this.sheetDataMap.put(sheetName, data);
        return this;
    }
    
    @Override
    public ExcelBuilder locale(Locale locale) {
        this.locale = locale;
        return this;
    }
    
    @Override
    public ExcelBuilder addConverter(ValueConverter converter) {
        this.converters.add(converter);
        return this;
    }
    
    @Override
    public ExcelBuilder addConverters(Collection<ValueConverter> converters) {
        if (converters != null) {
            this.converters.addAll(converters);
        }
        return this;
    }
    
    @Override
    public ExcelBuilder addConverters(ValueConverter... converters) {
        if (converters != null) {
            this.converters.addAll(Arrays.asList(converters));
        }
        return this;
    }
    
    @Override
    public ExcelBuilder addValidator(Validator validator) {
        this.validators.add(validator);
        return this;
    }
    
    @Override
    public ExcelBuilder addValidators(Collection<Validator> validators) {
        if (validators != null) {
            this.validators.addAll(validators);
        }
        return this;
    }
    
    @Override
    public ExcelBuilder addValidators(Validator... validators) {
        if (validators != null) {
            this.validators.addAll(Arrays.asList(validators));
        }
        return this;
    }
    
    @Override
    public ExcelBuilder addCellStyle(String name, CellStyle style) {
        this.namedStyles.put(name, style);
        return this;
    }
    
    @Override
    public ExcelBuilder i18nResolver(I18nResolver resolver) {
        this.i18nResolver = resolver;
        return this;
    }
    
    @Override
    public void write(OutputStream os) throws IOException {
        // 1. 문서 메타데이터 추출
        ExcelMeta meta = MetadataExtractor.extract(documentClass);
        
        // 2. 데이터 검증
        validateData(meta);
        
        // 3. 엔진에 처리 위임
        I18nResolver resolverToUse = i18nResolver != null ? 
            i18nResolver : ExcelContextHolder.getDefaultI18nResolver();
            
        engine.export(meta, sheetDataMap, converters, resolverToUse, locale, os);
    }
    
    private void validateData(ExcelMeta meta) {
        // 시트별 데이터 검증
        for (SheetMeta sheetMeta : meta.getSheets()) {
            String sheetName = sheetMeta.getName();
            List<?> data = sheetDataMap.get(sheetName);
            
            if (data == null) {
                throw new ExcelException("No data provided for sheet: " + sheetName);
            }
            
            // 각 데이터 항목 검증
            for (Object dto : data) {
                for (Validator validator : validators) {
                    validator.validate(dto);
                }
            }
        }
    }
}
```

이 빌더 API는 다음과 같은 기능을 제공합니다
- 명시적 호출 방식으로 AOP 없이도 사용 가능
- `sheetData()` 호출 순서와 `SheetConfig.name()` 매핑
- `locale()`로 다국어 헤더 자동 적용
- 플러그인(컨버터·검증기) 직접 등록 가능 - 단일, 컬렉션, 가변인자 형식 지원
- 엔진 타입 자동 결정 (설정에 따라)
- 커스텀 i18n 리졸버 설정 가능

### 3.3. 메타데이터 추출

```java
/**
 * 엑셀 문서 메타데이터
 */
public class ExcelMeta {
    private String fileName;
    private String template;
    private List<SheetMeta> sheets = new ArrayList<>();
    
    // getters and setters
}

/**
 * 시트 메타데이터
 */
public class SheetMeta {
    private String name;
    private Class<?> dtoClass;
    private String template;
    private CellReference startCell;
    private CellReference dataStartCell;
    private List<ColumnMeta> columns = new ArrayList<>();
    
    // startRow, startCol 등 편의 메서드들
    public int getStartRow() {
        return startCell.getRow();
    }
    
    public int getStartCol() {
        return startCell.getCol();
    }
    
    // getters and setters
}

/**
 * 컬럼 메타데이터
 */
public class ColumnMeta {
    private Field field;
    private int order;
    private String header;
    private String headerKey;
    private int width;
    private ExcelCellStyle headerStyle;
    private ExcelCellStyle dataStyle;
    
    // getters and setters
}

/**
 * 메타데이터 추출기
 */
public class MetadataExtractor {
    
    public static ExcelMeta extract(Class<?> documentClass) {
        ExcelMeta meta = new ExcelMeta();
        
        // 1. @ExcelDocument 애노테이션 처리
        if (!documentClass.isAnnotationPresent(ExcelDocument.class)) {
            throw new ExcelException("Class is not annotated with @ExcelDocument");
        }
        
        ExcelDocument docAnno = documentClass.getAnnotation(ExcelDocument.class);
        meta.setFileName(docAnno.fileName());
        meta.setTemplate(docAnno.template());
        
        // 2. 시트 메타데이터 추출
        for (SheetConfig sheetConfig : docAnno.sheets()) {
            SheetMeta sheetMeta = new SheetMeta();
            sheetMeta.setName(sheetConfig.name());
            sheetMeta.setDtoClass(sheetConfig.dto());
            sheetMeta.setTemplate(sheetConfig.template());
            
            // 시작 셀 파싱
            CellReference startRef = new CellReference(sheetConfig.startCell());
            sheetMeta.setStartCell(startRef);
            
            // 데이터 시작 셀 파싱 (지정된 경우)
            if (!sheetConfig.dataStartCell().isEmpty()) {
                sheetMeta.setDataStartCell(new CellReference(sheetConfig.dataStartCell()));
            } else {
                // 기본값: 헤더 다음 행
                sheetMeta.setDataStartCell(new CellReference(
                    startRef.getRow() + 1, startRef.getCol()));
            }
            
            // 3. 컬럼 메타데이터 추출
            extractColumns(sheetMeta);
            
            meta.getSheets().add(sheetMeta);
        }
        
        return meta;
    }
    
    private static void extractColumns(SheetMeta sheetMeta) {
        Class<?> dtoClass = sheetMeta.getDtoClass();
        Map<Integer, ColumnMeta> columnMap = new TreeMap<>(); // 순서 보장
        
        for (Field field : dtoClass.getDeclaredFields()) {
            if (field.isAnnotationPresent(ExcelColumn.class)) {
                ExcelColumn colAnno = field.getAnnotation(ExcelColumn.class);
                
                ColumnMeta colMeta = new ColumnMeta();
                colMeta.setField(field);
                colMeta.setOrder(colAnno.order());
                colMeta.setHeader(colAnno.header());
                colMeta.setHeaderKey(colAnno.headerKey());
                colMeta.setWidth(colAnno.width());
                colMeta.setHeaderStyle(colAnno.headerStyle());
                colMeta.setDataStyle(colAnno.dataStyle());
                
                columnMap.put(colAnno.order(), colMeta);
            }
        }
        
        // 컬럼 순서대로 추가
        sheetMeta.getColumns().addAll(columnMap.values());
    }
}
```

메타데이터 추출기는 `@ExcelDocument` 애노테이션이 적용된 클래스와 관련 DTO 클래스에서 엑셀 문서 생성에 필요한 모든 정보를 추출합니다.

## 4. Streaming Engine – 메모리 한계 극복

대용량 데이터 처리를 위해 Apache POI의 SXSSF(Streaming XML SpreadSheet Format) API를 활용합니다.

```java
/**
 * 엑셀 엔진 인터페이스
 */
public interface ExcelEngine {
    void export(ExcelMeta meta, 
                Map<String, List<?>> dataMap, 
                List<ValueConverter> converters,
                I18nResolver i18nResolver,
                Locale locale,
                OutputStream os) throws IOException;
}

/**
 * 스트리밍 방식 엑셀 엔진
 */
public class StreamingExcelEngine implements ExcelEngine {

    private final StyleManager styleManager;
    private final int windowSize;
    
    public StreamingExcelEngine(StyleManager styleManager,
                               @Value("${excel.streaming.window-size:100}") int windowSize) {
        this.styleManager = styleManager;
        this.windowSize = windowSize;
    }

    @Override
    public void export(ExcelMeta meta,
                       Map<String, List<?>> dataMap,
                       List<ValueConverter> converters,
                       I18nResolver i18nResolver,
                       Locale locale,
                       OutputStream os) throws IOException {

        // SXSSF 워크북 생성 (windowSize 행만 메모리에 유지)
        SXSSFWorkbook wb = new SXSSFWorkbook(windowSize);
        
        try {
            // 1. 템플릿 적용 (문서 전체 템플릿이 있는 경우)
            if (!meta.getTemplate().isEmpty()) {
                applyDocumentTemplate(wb, meta.getTemplate());
            }
            
            // 2. 각 시트 처리
            for (SheetMeta sheetMeta : meta.getSheets()) {
                String sheetName = sheetMeta.getName();
                List<?> data = dataMap.get(sheetName);
                
                if (data == null) {
                    throw new ExcelException("No data for sheet: " + sheetName);
                }
                
                // 2.1. 시트 생성
                Sheet sheet = wb.createSheet(sheetName);
                
                // 2.2. 시트별 템플릿 적용 (있는 경우)
                if (!sheetMeta.getTemplate().isEmpty()) {
                    applySheetTemplate(sheet, sheetMeta.getTemplate());
                }
                
                // 2.3. 헤더 작성
                writeHeader(sheet, sheetMeta, i18nResolver, locale);
                
                // 2.4. 데이터 행 작성
                writeData(sheet, sheetMeta, data, converters);
                
                // 2.5. 컬럼 너비 조정
                adjustColumnWidths(sheet, sheetMeta);
            }
            
            // 3. 파일 쓰기
            wb.write(os);
        } finally {
            // 4. 임시 파일 정리
            wb.dispose();
        }
    }

    private void applyDocumentTemplate(SXSSFWorkbook wb, String templatePath) {
        try (InputStream is = getClass().getResourceAsStream(templatePath)) {
            if (is == null) {
                throw new ExcelException("Template not found: " + templatePath);
            }
            
            XSSFWorkbook template = new XSSFWorkbook(is);
            
            // 템플릿 스타일 및 구조 복사
            // (여기서는 간략화를 위해 복잡한 템플릿 복사 로직 생략)
        } catch (IOException e) {
            throw new ExcelException("Failed to apply template", e);
        }
    }
    
    private void applySheetTemplate(Sheet sheet, String templatePath) {
        // 시트별 템플릿 적용 로직
    }

    private void writeHeader(Sheet sheet, SheetMeta sheetMeta, I18nResolver i18nResolver, Locale locale) {
        int startRow = sheetMeta.getStartRow();
        int startCol = sheetMeta.getStartCol();
        
        // 헤더 행 생성
        Row headerRow = sheet.createRow(startRow);
        
        // 각 컬럼 헤더 생성
        for (ColumnMeta colMeta : sheetMeta.getColumns()) {
            Cell cell = headerRow.createCell(startCol + colMeta.getOrder());
            
            // 헤더 텍스트 결정 (다국어 리소스 사용)
            String headerText;
            if (!colMeta.getHeaderKey().isEmpty()) {
                headerText = i18nResolver.getMessage(colMeta.getHeaderKey(), locale);
            } else {
                headerText = colMeta.getHeader();
            }
            
            cell.setCellValue(headerText);
            
            // 헤더 스타일 적용
            cell.setCellStyle(styleManager.getHeaderStyle(colMeta.getHeaderStyle(), sheet.getWorkbook()));
        }
    }
    
    private void writeData(Sheet sheet, SheetMeta sheetMeta, List<?> data, List<ValueConverter> converters) {
        int rowIdx = sheetMeta.getDataStartCell().getRow();
        int startCol = sheetMeta.getStartCol();
        
        // 각 데이터 행 처리
        for (Object dto : data) {
            Row row = sheet.createRow(rowIdx++);
            
            // 각 컬럼 데이터 작성
            for (ColumnMeta colMeta : sheetMeta.getColumns()) {
                Cell cell = row.createCell(startCol + colMeta.getOrder());
                
                // 필드 값 추출
                Object value = getFieldValue(dto, colMeta.getField());
                
                // 컨버터 적용
                value = applyConverters(value, colMeta.getField(), converters);
                
                // 셀에 값 설정
                setCellValue(cell, value);
                
                // 데이터 스타일 적용
                cell.setCellStyle(styleManager.getDataStyle(colMeta.getDataStyle(), sheet.getWorkbook()));
            }
        }
    }
    
    private Object getFieldValue(Object dto, Field field) {
        try {
            field.setAccessible(true);
            return field.get(dto);
        } catch (IllegalAccessException e) {
            throw new ExcelException("Failed to access field: " + field.getName(), e);
        }
    }
    
    private Object applyConverters(Object value, Field field, List<ValueConverter> converters) {
        if (value == null) return null;
        
        // 적용 가능한 모든 컨버터 적용
        for (ValueConverter converter : converters) {
            if (converter.supports(field)) {
                value = converter.convert(value);
            }
        }
        
        return value;
    }
    
    private void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
            return;
        }
        
        // 타입에 따른 셀 값 설정
        if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else if (value instanceof LocalDate) {
            cell.setCellValue(Date.from(((LocalDate) value).atStartOfDay(ZoneId.systemDefault()).toInstant()));
        } else if (value instanceof LocalDateTime) {
            cell.setCellValue(Date.from(((LocalDateTime) value).atZone(ZoneId.systemDefault()).toInstant()));
        } else {
            cell.setCellValue(value.toString());
        }
    }
    
    private void adjustColumnWidths(Sheet sheet, SheetMeta sheetMeta) {
        int startCol = sheetMeta.getStartCol();
        
        // 각 컬럼 너비 설정
        for (ColumnMeta colMeta : sheetMeta.getColumns()) {
            int colIndex = startCol + colMeta.getOrder();
            int width = colMeta.getWidth();
            
            if (width > 0) {
                // 너비가 지정된 경우 해당 너비로 설정
                sheet.setColumnWidth(colIndex, width * 256); // POI 단위 변환
            } else {
                // 자동 너비 조정
                sheet.autoSizeColumn(colIndex);
            }
        }
    }
}

/**
 * 인메모리 방식 엑셀 엔진
 */
public class InMemoryExcelEngine implements ExcelEngine {
    
    private final StyleManager styleManager;
    
    public InMemoryExcelEngine(StyleManager styleManager) {
        this.styleManager = styleManager;
    }
    
    @Override
    public void export(ExcelMeta meta, 
                      Map<String, List<?>> dataMap, 
                      List<ValueConverter> converters,
                      I18nResolver i18nResolver,
                      Locale locale, 
                      OutputStream os) throws IOException {
        
        // 일반 XSSFWorkbook 사용 (모든 데이터를 메모리에 유지)
        XSSFWorkbook wb = new XSSFWorkbook();
        
        try {
            // 구현 로직은 StreamingExcelEngine과 유사하나,
            // SXSSFWorkbook 특화 기능 사용하지 않음
            
            // 파일 쓰기
            wb.write(os);
        } finally {
            wb.close();
        }
    }
    
    // 나머지 메서드들은 StreamingExcelEngine과 유사
}
```

이 스트리밍 엔진은 다음과 같은 특징을 가집니다
- `new SXSSFWorkbook(windowSize)` → 메모리 상에 최대 windowSize 행만 유지
- `dispose()` 호출로 내부 임시파일 자동 삭제
- 템플릿 적용, 헤더 작성, 데이터 처리, 스타일링 등 모든 기능 지원
- 최대 100만 행 데이터도 서비스 메모리에 부담 없이 처리 가능

## 5. Plugin 아키텍처

### 5.1. ValueConverter

```java
/**
 * 필드 값 변환기 인터페이스
 */
public interface ValueConverter {
    /**
     * 이 변환기가 지원하는 필드인지 확인
     */
    boolean supports(Field field);
    
    /**
     * 원본 값을 변환하여 반환
     */
    Object convert(Object raw);
}

/**
 * 등급 코드를 텍스트로 변환하는 변환기 구현체
 */
@Component
public class GradeConverter implements ValueConverter {
    @Override
    public boolean supports(Field field) {
        // 'grade' 필드에만 적용
        return field.getName().equals("grade");
    }
    
    @Override
    public Object convert(Object raw) {
        if (raw == null) return null;
        
        // 등급 코드를 사람이 읽기 쉬운 텍스트로 변환
        return switch(raw.toString()) {
            case "G" -> "Gold";
            case "S" -> "Silver";
            case "B" -> "Bronze";
            default -> raw;
        };
    }
}

/**
 * 날짜 형식을 변환하는 변환기
 */
@Component
public class DateFormatConverter implements ValueConverter {
    private final DateTimeFormatter formatter;
    
    public DateFormatConverter(@Value("${excel.date.format:yyyy-MM-dd}") String pattern) {
        this.formatter = DateTimeFormatter.ofPattern(pattern);
    }
    
    @Override
    public boolean supports(Field field) {
        // LocalDate 타입 필드에만 적용
        return field.getType() == LocalDate.class;
    }
    
    @Override
    public Object convert(Object raw) {
        if (raw == null) return null;
        if (raw instanceof LocalDate) {
            return formatter.format((LocalDate) raw);
        }
        return raw;
    }
}

/**
 * 필드 애노테이션으로 변환기를 정의하는 방식
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ConvertValue {
    /**
     * 사용할 변환기 클래스
     */
    Class<? extends ValueConverter> converter();
    
    /**
     * 변환기에 전달할 속성
     */
    String[] args() default {};
}

/**
 * 애노테이션 기반 값 변환기
 */
public class AnnotationValueConverter implements ValueConverter {
    private final ApplicationContext context;
    
    public AnnotationValueConverter(ApplicationContext context) {
        this.context = context;
    }
    
    @Override
    public boolean supports(Field field) {
        return field.isAnnotationPresent(ConvertValue.class);
    }
    
    @Override
    public Object convert(Object raw) {
        if (raw == null) return null;
        
        try {
            Field field = getFieldFromContext(); // 현재 처리 중인 필드 가져오기
            ConvertValue anno = field.getAnnotation(ConvertValue.class);
            
            // 빈에서 변환기 가져오기 또는 생성
            ValueConverter delegateConverter = getConverter(anno.converter());
            
            return delegateConverter.convert(raw);
        } catch (Exception e) {
            throw new ExcelException("Failed to convert value", e);
        }
    }
    
    private ValueConverter getConverter(Class<? extends ValueConverter> converterClass) {
        try {
            // 빈으로 등록된 경우
            return context.getBean(converterClass);
        } catch (NoSuchBeanDefinitionException e) {
            // 등록되지 않은 경우 새로 생성
            try {
                return converterClass.getDeclaredConstructor().newInstance();
            } catch (Exception ex) {
                throw new ExcelException("Failed to create converter: " + converterClass.getName(), ex);
            }
        }
    }
    
    private Field getFieldFromContext() {
        // 현재 처리 중인 필드 정보를 ThreadLocal 등을 통해 가져오는 로직
        // (실제 구현에서는 컨텍스트 관리 필요)
        return ExcelContextHolder.getCurrentField();
    }
}
```

### 5.2. Validator

```java
/**
 * 필수값 검증 애노테이션
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface NotEmpty { 
    /**
     * 검증 실패 시 메시지
     */
    String message() default "필수 값입니다."; 
}

/**
 * 최대 길이 검증 애노테이션
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MaxLength {
    /**
     * 최대 허용 길이
     */
    int value();
    
    /**
     * 검증 실패 시 메시지
     */
    String message() default "최대 {value}자까지 입력 가능합니다.";
}

/**
 * 데이터 검증기 인터페이스
 */
public interface Validator {
    /**
     * DTO 객체 검증
     * @throws ValidationException 검증 실패 시
     */
    void validate(Object dto) throws ValidationException;
}

/**
 * 애노테이션 기반 검증기 구현체
 */
public class AnnotationValidator implements Validator {
    @Override
    public void validate(Object dto) {
        if (dto == null) {
            throw new ValidationException("DTO cannot be null");
        }
        
        // 모든 필드에 대해 검증
        for (Field field : dto.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            
            try {
                Object value = field.get(dto);
                
                // @NotEmpty 검증
                if (field.isAnnotationPresent(NotEmpty.class)) {
                    validateNotEmpty(field, value);
                }
                
                // @MaxLength 검증
                if (field.isAnnotationPresent(MaxLength.class)) {
                    validateMaxLength(field, value);
                }
                
                // 추가 검증 로직...
            } catch (IllegalAccessException e) {
                throw new ValidationException("Cannot access field: " + field.getName(), e);
            }
        }
    }
    
    private void validateNotEmpty(Field field, Object value) {
        NotEmpty anno = field.getAnnotation(NotEmpty.class);
        
        if (value == null || value.toString().isBlank()) {
            String fieldName = field.getName();
            String message = anno.message();
            
            throw new ValidationException(fieldName + ": " + message);
        }
    }
    
    private void validateMaxLength(Field field, Object value) {
        if (value == null) return;
        
        MaxLength anno = field.getAnnotation(MaxLength.class);
        int maxLength = anno.value();
        String strValue = value.toString();
        
        if (strValue.length() > maxLength) {
            String fieldName = field.getName();
            String message = anno.message().replace("{value}", String.valueOf(maxLength));
            
            throw new ValidationException(fieldName + ": " + message);
        }
    }
}

/**
 * 검증 예외
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### 5.3. Formatter

```java
/**
 * 셀 포맷터 인터페이스
 */
public interface CellFormatter {
    /**
     * 이 포맷터가 지원하는 필드인지 확인
     */
    boolean supports(Field field);
    
    /**
     * POI 셀 데이터 포맷 적용
     */
    void applyFormat(Cell cell, Object value);
}

/**
 * 전화번호 포맷터 구현체
 */
@Component
public class PhoneNumberFormatter implements CellFormatter {
    private final DataFormat format;
    
    public PhoneNumberFormatter(Workbook workbook) {
        this.format = workbook.createDataFormat();
    }
    
    @Override
    public boolean supports(Field field) {
        return field.isAnnotationPresent(PhoneNumber.class) || 
               field.getName().contains("phone") ||
               field.getName().contains("tel");
    }
    
    @Override
    public void applyFormat(Cell cell, Object value) {
        if (value == null) return;
        
        CellStyle style = cell.getCellStyle();
        // 전화번호 포맷 적용 (###-####-####)
        short formatIndex = format.getFormat("###-####-####");
        style.setDataFormat(formatIndex);
        cell.setCellStyle(style);
    }
}

/**
 * 포맷터 애노테이션
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Format {
    /**
     * 포맷 패턴
     * (예: "#,##0.00", "yyyy-mm-dd" 등)
     */
    String pattern();
}

/**
 * 전화번호 애노테이션
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface PhoneNumber {}

/**
 * 숫자 포맷 애노테이션
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface NumberFormat {
    /**
     * 포맷 패턴 (예: "#,##0", "#,##0.00" 등)
     */
    String pattern();
    
    /**
     * 소수점 자릿수
     */
    int decimals() default 2;
    
    /**
     * 천 단위 구분자 사용 여부
     */
    boolean useThousandSeparator() default true;
}

/**
 * 숫자 포맷터 구현체
 */
@Component
public class NumberFormatter implements CellFormatter {
    private final DataFormat dataFormat;
    
    public NumberFormatter(Workbook workbook) {
        this.dataFormat = workbook.createDataFormat();
    }
    
    @Override
    public boolean supports(Field field) {
        return field.isAnnotationPresent(NumberFormat.class) ||
               Number.class.isAssignableFrom(field.getType()) ||
               field.getType() == BigDecimal.class;
    }
    
    @Override
    public void applyFormat(Cell cell, Object value) {
        if (value == null) return;
        
        CellStyle style = cell.getCellStyle();
        String pattern;
        
        // 애노테이션이 있는 경우 해당 패턴 사용
        Field field = ExcelContextHolder.getCurrentField();
        if (field != null && field.isAnnotationPresent(NumberFormat.class)) {
            NumberFormat anno = field.getAnnotation(NumberFormat.class);
            if (!anno.pattern().isEmpty()) {
                pattern = anno.pattern();
            } else {
                // 기본 패턴 생성
                pattern = anno.useThousandSeparator() ? "#,##0" : "0";
                if (anno.decimals() > 0) {
                    pattern += ".";
                    pattern += "0".repeat(anno.decimals());
                }
            }
        } else {
            // 기본 숫자 포맷
            pattern = "#,##0.00";
        }
        
        // 스타일에 포맷 적용
        short formatIndex = dataFormat.getFormat(pattern);
        style.setDataFormat(formatIndex);
        cell.setCellStyle(style);
    }
}

/**
 * 날짜 포맷 애노테이션
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DateFormat {
    /**
     * 날짜 포맷 패턴 (예: "yyyy-MM-dd", "yyyy/MM/dd" 등)
     */
    String pattern() default "yyyy-MM-dd";
}

/**
 * 날짜 포맷터 구현체
 */
@Component
public class DateFormatter implements CellFormatter {
    private final DataFormat dataFormat;
    
    public DateFormatter(Workbook workbook) {
        this.dataFormat = workbook.createDataFormat();
    }
    
    @Override
    public boolean supports(Field field) {
        return field.isAnnotationPresent(DateFormat.class) ||
               field.getType() == Date.class ||
               field.getType() == LocalDate.class ||
               field.getType() == LocalDateTime.class;
    }
    
    @Override
    public void applyFormat(Cell cell, Object value) {
        if (value == null) return;
        
        CellStyle style = cell.getCellStyle();
        String pattern;
        
        // 애노테이션이 있는 경우 해당 패턴 사용
        Field field = ExcelContextHolder.getCurrentField();
        if (field != null && field.isAnnotationPresent(DateFormat.class)) {
            DateFormat anno = field.getAnnotation(DateFormat.class);
            pattern = anno.pattern();
        } else {
            // 타입에 따른 기본 포맷 적용
            if (field != null && field.getType() == LocalDateTime.class) {
                pattern = "yyyy-MM-dd HH:mm:ss";
            } else {
                pattern = "yyyy-MM-dd";
            }
        }
        
        // 스타일에 포맷 적용
        short formatIndex = dataFormat.getFormat(pattern);
        style.setDataFormat(formatIndex);
        cell.setCellStyle(style);
    }
}

/**
 * 포맷터 컴포지트 패턴 구현
 */
public class CompositeCellFormatter implements CellFormatter {
    private final List<CellFormatter> formatters;
    
    public CompositeCellFormatter(List<CellFormatter> formatters) {
        this.formatters = formatters;
    }
    
    @Override
    public boolean supports(Field field) {
        // 최소 하나의 포맷터가 지원하면 true
        return formatters.stream().anyMatch(formatter -> formatter.supports(field));
    }
    
    @Override
    public void applyFormat(Cell cell, Object value) {
        // 지원하는 첫 번째 포맷터 적용
        for (CellFormatter formatter : formatters) {
            Field field = ExcelContextHolder.getCurrentField();
            if (field != null && formatter.supports(field)) {
                formatter.applyFormat(cell, value);
                break;
            }
        }
    }
}

/**
 * 포맷터 등록 매니저
 */
@Component
public class FormatterManager {
    private final Map<String, CellFormatter> formatterMap = new HashMap<>();
    private CompositeCellFormatter compositeCellFormatter;
    
    @Autowired
    public FormatterManager(ApplicationContext context, Workbook workbook) {
        // 기본 포맷터 등록
        registerFormatter("phone", new PhoneNumberFormatter(workbook));
        registerFormatter("number", new NumberFormatter(workbook));
        registerFormatter("date", new DateFormatter(workbook));
        
        // 빈으로 등록된 포맷터도 자동 등록
        context.getBeansOfType(CellFormatter.class).values()
               .forEach(formatter -> registerFormatter(
                   formatter.getClass().getSimpleName(), formatter));
               
        // 합성 포맷터 생성
        List<CellFormatter> allFormatters = new ArrayList<>(formatterMap.values());
        this.compositeCellFormatter = new CompositeCellFormatter(allFormatters);
    }
    
    public void registerFormatter(String name, CellFormatter formatter) {
        formatterMap.put(name, formatter);
    }
    
    public CellFormatter getFormatter(String name) {
        return formatterMap.get(name);
    }
    
    public CellFormatter getCompositeFormatter() {
        return compositeCellFormatter;
    }
}
```

### 5.4. 다이나믹 플러그인 라이프사이클

플러그인들은 단순히 스프링 빈으로 등록되는 것을 넘어, 동적인 라이프사이클을 가집니다. 이는 런타임에 새로운 플러그인을 등록하거나 기존 플러그인을 교체하는 것을 가능하게 합니다.

```java
/**
 * 플러그인 라이프사이클 관리자
 */
@Component
public class PluginLifecycleManager {
    private final List<ValueConverter> valueConverters = new ArrayList<>();
    private final List<Validator> validators = new ArrayList<>();
    private final FormatterManager formatterManager;
    
    @Autowired
    public PluginLifecycleManager(
            List<ValueConverter> converters,
            List<Validator> validators,
            FormatterManager formatterManager) {
        // 스프링 빈으로 등록된 모든 플러그인 초기화
        this.valueConverters.addAll(converters);
        this.validators.addAll(validators);
        this.formatterManager = formatterManager;
    }
    
    /**
     * 모든 값 변환기 조회
     */
    public List<ValueConverter> getAllValueConverters() {
        return Collections.unmodifiableList(valueConverters);
    }
    
    /**
     * 모든 검증기 조회
     */
    public List<Validator> getAllValidators() {
        return Collections.unmodifiableList(validators);
    }
    
    /**
     * 런타임에 새 변환기 등록
     */
    public void registerValueConverter(ValueConverter converter) {
        valueConverters.add(converter);
    }
    
    /**
     * 런타임에 새 검증기 등록
     */
    public void registerValidator(Validator validator) {
        validators.add(validator);
    }
    
    /**
     * 특정 변환기 비활성화
     */
    public void disableValueConverter(Class<? extends ValueConverter> converterClass) {
        valueConverters.removeIf(c -> c.getClass().equals(converterClass));
    }
    
    /**
     * 특정 검증기 비활성화
     */
    public void disableValidator(Class<? extends Validator> validatorClass) {
        validators.removeIf(v -> v.getClass().equals(validatorClass));
    }
    
    /**
     * 플러그인 인스턴스 생성 (팩토리 메서드)
     */
    public <T> T createPlugin(Class<T> pluginClass, Object... args) {
        try {
            // 생성자 찾기
            Constructor<?>[] constructors = pluginClass.getDeclaredConstructors();
            Constructor<?> constructor = null;
            
            for (Constructor<?> c : constructors) {
                if (c.getParameterCount() == args.length) {
                    constructor = c;
                    break;
                }
            }
            
            if (constructor == null) {
                throw new ExcelException("No suitable constructor found for " + pluginClass.getName());
            }
            
            constructor.setAccessible(true);
            @SuppressWarnings("unchecked")
            T instance = (T) constructor.newInstance(args);
            return instance;
        } catch (Exception e) {
            throw new ExcelException("Failed to create plugin: " + pluginClass.getName(), e);
        }
    }
}
```

### 5.5. JSON 기반 플러그인 설정

복잡한 플러그인 구성을 쉽게 설정하기 위해 JSON 기반 설정 지원:

```java
/**
 * JSON 기반 플러그인 설정 로더
 */
@Component
public class PluginConfigLoader {
    private final ObjectMapper objectMapper;
    private final PluginLifecycleManager pluginManager;
    
    public PluginConfigLoader(
            ObjectMapper objectMapper,
            PluginLifecycleManager pluginManager) {
        this.objectMapper = objectMapper;
        this.pluginManager = pluginManager;
    }
    
    /**
     * JSON 설정 파일에서 플러그인 구성 로드
     */
    public void loadConfig(Resource configResource) throws IOException {
        JsonNode config = objectMapper.readTree(configResource.getInputStream());
        
        // 변환기 설정 처리
        if (config.has("converters")) {
            JsonNode convertersNode = config.get("converters");
            for (JsonNode node : convertersNode) {
                loadConverter(node);
            }
        }
        
        // 검증기 설정 처리
        if (config.has("validators")) {
            JsonNode validatorsNode = config.get("validators");
            for (JsonNode node : validatorsNode) {
                loadValidator(node);
            }
        }
        
        // 포맷터 설정 처리
        if (config.has("formatters")) {
            JsonNode formattersNode = config.get("formatters");
            for (JsonNode node : formattersNode) {
                loadFormatter(node);
            }
        }
    }
    
    private void loadConverter(JsonNode node) {
        try {
            String className = node.get("class").asText();
            Class<?> converterClass = Class.forName(className);
            
            // 파라미터 처리
            List<Object> params = new ArrayList<>();
            if (node.has("params")) {
                JsonNode paramsNode = node.get("params");
                for (JsonNode paramNode : paramsNode) {
                    params.add(objectMapper.treeToValue(paramNode, Object.class));
                }
            }
            
            // 플러그인 생성 및 등록
            ValueConverter converter = pluginManager.createPlugin(
                (Class<ValueConverter>) converterClass, 
                params.toArray()
            );
            pluginManager.registerValueConverter(converter);
        } catch (Exception e) {
            throw new ExcelException("Failed to load converter from JSON config", e);
        }
    }
    
    private void loadValidator(JsonNode node) {
        // 검증기 로딩 로직 (변환기와 유사)
    }
    
    private void loadFormatter(JsonNode node) {
        // 포맷터 로딩 로직 (변환기와 유사)
    }
}
```

### 5.6. 플러그인 사용 예시

다음은 다양한 플러그인을 활용하는 종합적인 예시입니다

```java
@RestController
@RequiredArgsConstructor
public class AdvancedReportController {
    private final ExcelBuilder excelBuilder;
    private final PluginLifecycleManager pluginManager;
    private final FormatterManager formatterManager;
    
    @GetMapping("/report/advanced")
    public void downloadAdvancedReport(HttpServletResponse response, Locale locale) throws IOException {
        // 데이터 준비
        List<AdvancedReportDto> data = prepareReportData();
        
        // 동적 필드별 전용 변환기 생성
        ValueConverter customConverter = new ValueConverter() {
            @Override
            public boolean supports(Field field) {
                return field.getName().equals("status");
            }
            
            @Override
            public Object convert(Object raw) {
                if (raw == null) return null;
                String status = raw.toString();
                // 비즈니스 로직에 따른 동적 변환
                if (status.startsWith("P")) {
                    return "진행중 (" + status + ")";
                } else if (status.startsWith("C")) {
                    return "완료 (" + status + ")";
                }
                return raw;
            }
        };
        
        // 응답 설정
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=advanced_report.xlsx");
        
        // 시스템에 등록된 모든 변환기 + 동적 생성 변환기 함께 사용
        List<ValueConverter> allConverters = new ArrayList<>(pluginManager.getAllValueConverters());
        allConverters.add(customConverter);
        
        // 빌더 구성 및 출력
        excelBuilder.create()
                   .document(AdvancedReportDoc.class)
                   .locale(locale)
                   .sheetData("Report", data)
                   .addConverters(allConverters)    // 다중 변환기 추가
                   .addValidators(pluginManager.getAllValidators())  // 모든 검증기 추가
                   .write(response.getOutputStream());
    }
    
    private List<AdvancedReportDto> prepareReportData() {
        // 테스트 데이터 생성
        return IntStream.range(1, 11)
                .mapToObj(i -> {
                    AdvancedReportDto dto = new AdvancedReportDto();
                    dto.setId(i);
                    dto.setName("Item " + i);
                    dto.setAmount(BigDecimal.valueOf(i * 1000 + Math.random() * 100));
                    dto.setStatus(i % 2 == 0 ? "P" + i : "C" + i);
                    dto.setCreatedDate(LocalDate.now().minusDays(i));
                    dto.setPhone("010-1234-" + (1000 + i));
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
```

## 6. i18n 헤더와 글로벌 스타일

### 6.1. application.yml 설정

```yaml
excel:
  # 엔진 타입: inMemory 또는 streaming
  engine: streaming
  
  # 스트리밍 설정
  streaming:
    window-size: 100  # 메모리에 유지할 행 수
  
  # 기본 스타일 설정
  default:
    font:
      name: "Arial"
      size: 11
      color: "#000000"
    header:
      font:
        name: "Arial"
        size: 12
        bold: true
        color: "#FFFFFF"
      bgColor: "#4472C4"
      align: CENTER
    border:
      all: THIN
    align: CENTER
    wrapText: false
  
  # 날짜/시간 포맷
  date:
    format: "yyyy-MM-dd"
  datetime:
    format: "yyyy-MM-dd HH:mm:ss"
```

### 6.2. 스프링 부트 자동 설정

```java
@Configuration
@EnableConfigurationProperties(ExcelProperties.class)
@ConditionalOnClass(Workbook.class)
@ComponentScan("com.example.excel")
public class ExcelAutoConfiguration {

    private final ExcelProperties properties;
    
    public ExcelAutoConfiguration(ExcelProperties properties) {
        this.properties = properties;
    }
    
    @Bean
    @ConditionalOnMissingBean
    public ExcelEngine excelEngine(StyleManager styleManager) {
        if ("streaming".equals(properties.getEngine())) {
            return new StreamingExcelEngine(
                styleManager, 
                properties.getStreaming().getWindowSize()
            );
        } else {
            return new InMemoryExcelEngine(styleManager);
        }
    }
    
    @Bean
    @ConditionalOnMissingBean
    public I18nResolver i18nResolver(MessageSource messageSource) {
        return new I18nResolverImpl(messageSource);
    }
    
    @Bean
    @ConditionalOnMissingBean
    public StyleManager styleManager() {
        return new StyleManagerImpl(properties.getDefault());
    }
    
    @Bean
    @ConditionalOnMissingBean
    public ExcelBuilder excelBuilder(ExcelEngine engine, I18nResolver i18nResolver) {
        return new ExcelBuilderImpl(engine, i18nResolver);
    }
}

@ConfigurationProperties(prefix = "excel")
@Data
public class ExcelProperties {
    private String engine = "inMemory";
    private StreamingProperties streaming = new StreamingProperties();
    private DefaultStyleProperties defaults = new DefaultStyleProperties();
    private DateFormatProperties date = new DateFormatProperties();
    
    @Data
    public static class StreamingProperties {
        private int windowSize = 100;
    }
    
    @Data
    public static class DefaultStyleProperties {
        private FontProperties font = new FontProperties();
        private HeaderProperties header = new HeaderProperties();
        private BorderProperties border = new BorderProperties();
        private String align = "CENTER";
        private boolean wrapText = false;
    }
    
    @Data
    public static class FontProperties {
        private String name = "Arial";
        private int size = 11;
        private String color = "#000000";
        private boolean bold = false;
    }
    
    @Data
    public static class HeaderProperties {
        private FontProperties font = new FontProperties();
        private String bgColor = "#4472C4";
        private String align = "CENTER";
    }
    
    @Data
    public static class BorderProperties {
        private String all = "THIN";
    }
    
    @Data
    public static class DateFormatProperties {
        private String format = "yyyy-MM-dd";
    }
}
```

### 6.3. 다국어 헤더

```properties
# messages_ko.properties
user.id=번호
user.name=이름
user.email=이메일
user.grade=등급
user.joinDate=가입일

# messages_en.properties
user.id=ID
user.name=Name
user.email=Email
user.grade=Grade
user.joinDate=Join Date
```

```java
/**
 * i18n 리졸버 인터페이스
 */
public interface I18nResolver {
    /**
     * 키에 해당하는 다국어 메시지 조회
     */
    String getMessage(String key, Locale locale);
    
    /**
     * 인자가 있는 다국어 메시지 조회
     */
    String getMessage(String key, Object[] args, Locale locale);
    
    /**
     * 모든 Locale 지원 여부 확인
     */
    boolean supportsAllLocales();
    
    /**
     * 지원하는 Locale 목록 조회
     */
    List<Locale> getSupportedLocales();
}

/**
 * i18n 리졸버 기본 구현체
 */
public class I18nResolverImpl implements I18nResolver {
    private final MessageSource messageSource;
    
    public I18nResolverImpl(MessageSource messageSource) {
        this.messageSource = messageSource;
    }
    
    @Override
    public String getMessage(String key, Locale locale) {
        return getMessage(key, null, locale);
    }
    
    @Override
    public String getMessage(String key, Object[] args, Locale locale) {
        try {
            return messageSource.getMessage(key, args, key, locale);
        } catch (NoSuchMessageException e) {
            return key; // 메시지 없을 경우 키 그대로 반환
        }
    }
    
    @Override
    public boolean supportsAllLocales() {
        return true; // 기본 구현은 모든 로케일 지원 가능
    }
    
    @Override
    public List<Locale> getSupportedLocales() {
        // 기본적으로 지원 가능한 모든 로케일 반환
        // 실제 구현에서는 등록된 메시지 소스에 따라 결정
        return Arrays.asList(Locale.getAvailableLocales());
    }
}

/**
 * 다중 메시지 소스 지원 i18n 리졸버
 */
public class CompositeI18nResolver implements I18nResolver {
    private final List<I18nResolver> resolvers;
    
    public CompositeI18nResolver(I18nResolver... resolvers) {
        this.resolvers = Arrays.asList(resolvers);
    }
    
    public CompositeI18nResolver(Collection<I18nResolver> resolvers) {
        this.resolvers = new ArrayList<>(resolvers);
    }
    
    @Override
    public String getMessage(String key, Locale locale) {
        return getMessage(key, null, locale);
    }
    
    @Override
    public String getMessage(String key, Object[] args, Locale locale) {
        // 모든 리졸버에서 순차적으로 조회 시도
        for (I18nResolver resolver : resolvers) {
            try {
                String message = resolver.getMessage(key, args, locale);
                // 키와 동일하지 않은 경우 = 메시지를 찾은 경우
                if (!message.equals(key)) {
                    return message;
                }
            } catch (Exception ignored) {
                // 다음 리졸버로 시도
            }
        }
        
        // 모든 리졸버에서 키를 찾지 못한 경우 키 그대로 반환
        return key;
    }
    
    @Override
    public boolean supportsAllLocales() {
        // 하나라도 모든 로케일을 지원하면 true
        return resolvers.stream().anyMatch(I18nResolver::supportsAllLocales);
    }
    
    @Override
    public List<Locale> getSupportedLocales() {
        // 모든 리졸버의 지원 로케일 합집합
        Set<Locale> locales = new HashSet<>();
        resolvers.forEach(r -> locales.addAll(r.getSupportedLocales()));
        return new ArrayList<>(locales);
    }
}
```

### 6.4. 스타일 매니저

```java
/**
 * 셀 스타일 관리자 인터페이스
 */
public interface StyleManager {
    /**
     * 헤더 스타일 생성
     */
    CellStyle getHeaderStyle(ExcelCellStyle style, Workbook workbook);
    
    /**
     * 데이터 셀 스타일 생성
     */
    CellStyle getDataStyle(ExcelCellStyle style, Workbook workbook);
}

/**
 * 스타일 매니저 구현체
 */
public class StyleManagerImpl implements StyleManager {
    private final DefaultStyleProperties defaultProps;
    private final Map<String, CellStyle> styleCache = new HashMap<>();
    
    public StyleManagerImpl(DefaultStyleProperties defaultProps) {
        this.defaultProps = defaultProps;
    }
    
    @Override
    public CellStyle getHeaderStyle(ExcelCellStyle style, Workbook workbook) {
        String styleKey = "header-" + getStyleKey(style);
        
        // 캐싱된 스타일 반환
        if (styleCache.containsKey(styleKey)) {
            return styleCache.get(styleKey);
        }
        
        // 새 헤더 스타일 생성
        CellStyle cellStyle = workbook.createCellStyle();
        
        // 폰트 설정
        Font font = workbook.createFont();
        font.setFontName(getOrDefault(style.fontName(), defaultProps.getHeader().getFont().getName()));
        font.setFontHeightInPoints(getOrDefault(style.fontSize(), defaultProps.getHeader().getFont().getSize()));
        font.setBold(getOrDefault(style.bold(), defaultProps.getHeader().getFont().isBold()));
        
        // 폰트 색상
        String fontColor = getOrDefault(style.fontColor(), defaultProps.getHeader().getFont().getColor());
        setFontColor(font, fontColor);
        
        cellStyle.setFont(font);
        
        // 배경색
        String bgColor = getOrDefault(style.bgColor(), defaultProps.getHeader().getBgColor());
        setCellBgColor(cellStyle, bgColor);
        
        // 정렬
        setCellAlignment(cellStyle, style.hAlign(), style.vAlign());
        
        // 테두리
        setCellBorder(cellStyle, style.border());
        
        // 자동 줄바꿈
        cellStyle.setWrapText(getOrDefault(style.wrapText(), defaultProps.isWrapText()));
        
        // 캐시에 저장
        styleCache.put(styleKey, cellStyle);
        
        return cellStyle;
    }
    
    @Override
    public CellStyle getDataStyle(ExcelCellStyle style, Workbook workbook) {
        String styleKey = "data-" + getStyleKey(style);
        
        // 캐싱된 스타일 반환
        if (styleCache.containsKey(styleKey)) {
            return styleCache.get(styleKey);
        }
        
        // 새 데이터 스타일 생성
        CellStyle cellStyle = workbook.createCellStyle();
        
        // 폰트 설정
        Font font = workbook.createFont();
        font.setFontName(getOrDefault(style.fontName(), defaultProps.getFont().getName()));
        font.setFontHeightInPoints(getOrDefault(style.fontSize(), defaultProps.getFont().getSize()));
        font.setBold(getOrDefault(style.bold(), defaultProps.getFont().isBold()));
        
        // 폰트 색상
        String fontColor = getOrDefault(style.fontColor(), defaultProps.getFont().getColor());
        setFontColor(font, fontColor);
        
        cellStyle.setFont(font);
        
        // 배경색
        if (!style.bgColor().isEmpty()) {
            setCellBgColor(cellStyle, style.bgColor());
        }
        
        // 정렬
        setCellAlignment(cellStyle, style.hAlign(), style.vAlign());
        
        // 테두리
        setCellBorder(cellStyle, style.border());
        
        // 자동 줄바꿈
        cellStyle.setWrapText(getOrDefault(style.wrapText(), defaultProps.isWrapText()));
        
        // 캐시에 저장
        styleCache.put(styleKey, cellStyle);
        
        return cellStyle;
    }
    
    // 헬퍼 메서드들...
    private String getStyleKey(ExcelCellStyle style) {
        // 스타일의 고유 키 생성 로직
        return style.fontName() + style.fontSize() + style.fontColor() + 
               style.bgColor() + style.hAlign() + style.vAlign() + style.border();
    }
    
    private <T> T getOrDefault(T value, T defaultValue) {
        if (value == null || (value instanceof String && ((String) value).isEmpty()) || 
            (value instanceof Number && ((Number) value).intValue() < 0)) {
            return defaultValue;
        }
        return value;
    }
    
    private void setFontColor(Font font, String colorHex) {
        if (colorHex != null && !colorHex.isEmpty()) {
            IndexedColors idxColor = getIndexedColorFromHex(colorHex);
            if (idxColor != null) {
                font.setColor(idxColor.getIndex());
            } else if (font instanceof XSSFFont) {
                ((XSSFFont) font).setColor(new XSSFColor(hexToRGB(colorHex), null));
            }
        }
    }
    
    private void setCellBgColor(CellStyle style, String colorHex) {
        if (colorHex != null && !colorHex.isEmpty()) {
            IndexedColors idxColor = getIndexedColorFromHex(colorHex);
            if (idxColor != null) {
                style.setFillForegroundColor(idxColor.getIndex());
            } else if (style instanceof XSSFCellStyle) {
                ((XSSFCellStyle) style).setFillForegroundColor(
                    new XSSFColor(hexToRGB(colorHex), null));
            }
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
    }
    
    private void setCellAlignment(CellStyle style, HAlign hAlign, VAlign vAlign) {
        // 가로 정렬
        if (hAlign != HAlign.DEFAULT) {
            style.setAlignment(switch (hAlign) {
                case LEFT -> HorizontalAlignment.LEFT;
                case CENTER -> HorizontalAlignment.CENTER;
                case RIGHT -> HorizontalAlignment.RIGHT;
                default -> HorizontalAlignment.CENTER;
            });
        } else {
            // 기본 가로 정렬
            style.setAlignment(HorizontalAlignment.valueOf(defaultProps.getAlign()));
        }
        
        // 세로 정렬
        if (vAlign != VAlign.DEFAULT) {
            style.setVerticalAlignment(switch (vAlign) {
                case TOP -> VerticalAlignment.TOP;
                case MIDDLE -> VerticalAlignment.CENTER;
                case BOTTOM -> VerticalAlignment.BOTTOM;
                default -> VerticalAlignment.CENTER;
            });
        } else {
            // 기본 세로 정렬
            style.setVerticalAlignment(VerticalAlignment.CENTER);
        }
    }
    
    private void setCellBorder(CellStyle style, BorderStyle border) {
        org.apache.poi.ss.usermodel.BorderStyle poiBorder;
        
        if (border == BorderStyle.DEFAULT) {
            // 기본 테두리 스타일
            poiBorder = org.apache.poi.ss.usermodel.BorderStyle.valueOf(defaultProps.getBorder().getAll());
        } else {
            // 지정된 테두리 스타일
            poiBorder = switch (border) {
                case NONE -> org.apache.poi.ss.usermodel.BorderStyle.NONE;
                case THIN -> org.apache.poi.ss.usermodel.BorderStyle.THIN;
                case MEDIUM -> org.apache.poi.ss.usermodel.BorderStyle.MEDIUM;
                case THICK -> org.apache.poi.ss.usermodel.BorderStyle.THICK;
                default -> org.apache.poi.ss.usermodel.BorderStyle.THIN;
            };
        }
        
        // 상하좌우 모든 테두리에 적용
        style.setBorderTop(poiBorder);
        style.setBorderRight(poiBorder);
        style.setBorderBottom(poiBorder);
        style.setBorderLeft(poiBorder);
    }
    
    // 색상 변환 헬퍼 메서드들...
    private byte[] hexToRGB(String colorHex) {
        if (colorHex.startsWith("#")) {
            colorHex = colorHex.substring(1);
        }
        
        int r = Integer.parseInt(colorHex.substring(0, 2), 16);
        int g = Integer.parseInt(colorHex.substring(2, 4), 16);
        int b = Integer.parseInt(colorHex.substring(4, 6), 16);
        
        return new byte[] { (byte) r, (byte) g, (byte) b };
    }
    
    private IndexedColors getIndexedColorFromHex(String colorHex) {
        // 일반적인 색상 매핑 (최적화를 위해)
        return switch (colorHex.toUpperCase()) {
            case "#000000" -> IndexedColors.BLACK;
            case "#FFFFFF" -> IndexedColors.WHITE;
            case "#FF0000" -> IndexedColors.RED;
            case "#00FF00" -> IndexedColors.GREEN;
            case "#0000FF" -> IndexedColors.BLUE;
            case "#FFFF00" -> IndexedColors.YELLOW;
            // ... 더 많은 색상 매핑
            default -> null; // 매핑 없음, XSSFColor 사용
        };
    }
}
```

## 7. 실제 사용 예시

### 7.1. 문서 및 DTO 클래스 정의

```java
/**
 * 전체 보고서 문서 정의
 */
@ExcelDocument(
  fileName = "full_report.xlsx",
  sheets = {
    @SheetConfig(name="Summary", dto=SummaryDto.class, startCell="B3"),
    @SheetConfig(name="Details", dto=DetailDto.class)
  }
)
public class FullReportDoc {}

/**
 * 요약 정보 DTO
 */
public class SummaryDto {
    @ExcelColumn(order=0, headerKey="summary.category")
    private String category;
    
    @ExcelColumn(order=1, headerKey="summary.count")
    private Integer count;
    
    @ExcelColumn(order=2, headerKey="summary.amount", 
                dataStyle=@ExcelCellStyle(hAlign=HAlign.RIGHT))
    private BigDecimal amount;
    
    // getters and setters
}

/**
 * 상세 정보 DTO
 */
public class DetailDto {
    @ExcelColumn(order=0, headerKey="user.id")
    @NotEmpty(message="사용자 ID는 필수입니다")
    private String userId;
    
    @ExcelColumn(order=1, headerKey="user.name")
    @NotEmpty
    @MaxLength(100)
    private String name;
    
    @ExcelColumn(order=2, headerKey="user.email")
    @NotEmpty
    private String email;
    
    @ExcelColumn(order=3, headerKey="user.grade")
    private String grade;  // "G", "S", "B" 등의 코드 값
    
    @ExcelColumn(order=4, headerKey="user.joinDate")
    private LocalDate joinDate;
    
    // getters and setters
}
```

### 7.2. 컨트롤러에서 사용

```java
@RestController
@RequiredArgsConstructor
public class ReportController {
    private final ExcelBuilder excelBuilder;
    private final ReportService reportService;
    private final GradeConverter gradeConverter;
    private final AnnotationValidator validator;
    private final I18nResolver i18nResolver;

    /**
     * 일반적인 빌더 API 사용 방식
     */
    @GetMapping("/report/download")
    public void downloadReport(HttpServletResponse response, Locale locale) throws IOException {
        // 데이터 조회
        List<SummaryDto> summaries = reportService.getSummaries();
        List<DetailDto> details = reportService.getDetails();
        
        // 응답 헤더 설정
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=full_report.xlsx");

        // 엑셀 빌더로 문서 생성 및 출력
        excelBuilder.create()
                   .document(FullReportDoc.class)  // 문서 구조 정의
                   .locale(locale)                 // 다국어 설정
                   .sheetData("Summary", summaries) // 시트별 데이터
                   .sheetData("Details", details)
                   .addConverter(gradeConverter)    // 값 변환기 추가
                   .addValidator(validator)         // 검증기 추가
                   .i18nResolver(i18nResolver)      // 다국어 리졸버 설정
                   .write(response.getOutputStream());
    }
    
    /**
     * 여러 변환기와 검증기를 한 번에 추가하는 방식
     */
    @GetMapping("/report/download-multi")
    public void downloadReportWithMulti(HttpServletResponse response, Locale locale) throws IOException {
        // 데이터 조회
        List<SummaryDto> summaries = reportService.getSummaries();
        List<DetailDto> details = reportService.getDetails();
        
        // 변환기 목록 준비
        List<ValueConverter> converters = List.of(
            gradeConverter,
            new DateFormatConverter(),
            new CodeValueConverter()
        );
        
        // 검증기 목록 준비
        List<Validator> validators = List.of(
            validator,
            new CustomBusinessValidator()
        );
        
        // 응답 헤더 설정
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=full_report.xlsx");

        // 엑셀 빌더로 문서 생성 및 출력 - 다중 컨버터/검증기 추가
        excelBuilder.create()
                   .document(FullReportDoc.class)    // 문서 구조 정의
                   .locale(locale)                   // 다국어 설정
                   .sheetData("Summary", summaries)  // 시트별 데이터
                   .sheetData("Details", details)
                   .addConverters(converters)        // 다중 변환기 추가
                   .addValidators(validators)        // 다중 검증기 추가
                   .i18nResolver(i18nResolver)       // 다국어 리졸버 설정
                   .write(response.getOutputStream());
    }
    
/**
 * 가변 인자를 사용한 방식
 */
@GetMapping("/report/download-varargs")
public void downloadReportWithVararg(HttpServletResponse response, Locale locale) throws IOException {
    // 데이터 조회
    List<SummaryDto> summaries = reportService.getSummaries();
    List<DetailDto> details = reportService.getDetails();
        
    // 응답 헤더 설정
    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setHeader("Content-Disposition", "attachment; filename=full_report.xlsx");

    // 엑셀 빌더로 문서 생성 및 출력 - 가변 인자로 다중 추가
    excelBuilder.create()
            .document(FullReportDoc.class)    // 문서 구조 정의
            .locale(locale)                   // 다국어 설정
            .sheetData("Summary", summaries)  // 시트별 데이터
            .sheetData("Details", details)
            .addConverters(                   // 가변 인자로 여러 변환기 추가
                gradeConverter,
                new DateFormatConverter(),
                new CodeValueConverter()
            )
            .addValidators(                   // 가변 인자로 여러 검증기 추가
               validator,
               new CustomBusinessValidator()
            )
            .i18nResolver(i18nResolver)       // 다국어 리졸버 설정
            .write(response.getOutputStream());
}
    
/**
 * AOP 방식으로 간편하게 사용
 */
@GetMapping("/report/download-aop")
@ExcelResponse(documentClass = FullReportDoc.class)
public Map<String, List<?>> downloadReportAOP(Locale locale) {
    // AOP에서 @ExcelResponse 애노테이션을 감지하여 결과를 엑셀로 변환
    Map<String, List<?>> sheetData = new HashMap<>();
    sheetData.put("Summary", reportService.getSummaries());
    sheetData.put("Details", reportService.getDetails());
        
    return sheetData;
}

/**
 * AOP를 위한 애노테이션
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ExcelResponse {
    Class<?> documentClass();
    String fileName() default "";
}

/**
 * 엑셀 응답 AOP 어드바이스
 */
@Aspect
@Component
@RequiredArgsConstructor
public class ExcelResponseAspect {
    private final ExcelBuilder excelBuilder;
    private final GradeConverter gradeConverter;
    private final AnnotationValidator validator;
    private final I18nResolver i18nResolver;
    
    @Around("@annotation(excelResponse)")
    public Object handleExcelResponse(ProceedingJoinPoint joinPoint, ExcelResponse excelResponse) throws Throwable {
        // 원본 메서드 실행
        Object result = joinPoint.proceed();
        
        if (!(result instanceof Map)) {
            throw new IllegalStateException("Method with @ExcelResponse must return Map<String, List<?>>");
        }
        
        // HTTP 응답 객체 가져오기
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        HttpServletResponse response = ((ServletRequestAttributes) requestAttributes)
            .getResponse();
        
        // Locale 가져오기
        Locale locale = LocaleContextHolder.getLocale();
        
        // 엑셀 문서 클래스 정보
        Class<?> documentClass = excelResponse.documentClass();
        
        // 엑셀 파일명 가져오기
        String filename;
        if (!excelResponse.fileName().isEmpty()) {
            filename = excelResponse.fileName();
        } else {
            ExcelDocument docAnno = documentClass.getAnnotation(ExcelDocument.class);
            filename = docAnno.fileName();
        }
        
        // 응답 헤더 설정
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=" + filename);
        
        // 엑셀 빌더 구성 및 출력
        ExcelBuilder builder = excelBuilder.create()
                                .document(documentClass)
                                .locale(locale)
                                .addConverter(gradeConverter)
                                .addValidator(validator)
                                .i18nResolver(i18nResolver);
        
        // 시트별 데이터 추가
        @SuppressWarnings("unchecked")
        Map<String, List<?>> sheetData = (Map<String, List<?>>) result;
        for (Map.Entry<String, List<?>> entry : sheetData.entrySet()) {
            builder.sheetData(entry.getKey(), entry.getValue());
        }
        
        // 출력
        builder.write(response.getOutputStream());
        
        return null; // 이미 응답이 작성되었으므로 null 반환
    }
}
```

## 8. 성능 최적화 및 대용량 처리

### 8.1. 스트리밍 처리의 실제 성능

스트리밍 엔진(`SXSSFWorkbook`)은 Apache POI의 일반 워크북(`XSSFWorkbook`)에 비해 대용량 처리에서 큰 장점을 제공합니다. 간단한 벤치마크를 통해 차이를 확인해 보겠습니다

|  행 수   | XSSFWorkbook (메모리) | SXSSFWorkbook (100행 윈도우) |
|---------|-----------------------|----------------------------|
| 1만 행   | 150MB                 | 35MB                       |
| 10만 행  | 1.1GB                 | 40MB                       |
| 100만 행 | OOM 발생               | 45MB                       |

`SXSSFWorkbook`은 메모리에 지정된 윈도우 크기만큼의 행만 유지하고, 나머지는 임시 파일로 관리하기 때문에 대용량 처리가 가능합니다.

### 추가적으로 사용할 수 있는 최적화 방법

1. **비동기 처리**: 대용량 처리 시 비동기로 파일 생성 후 다운로드 URL 반환 ()
   ```java
   @Async
   public CompletableFuture<String> generateExcelAsync(Class<?> docClass, Map<String, List<?>> data) {
       String fileId = UUID.randomUUID().toString();
       String filePath = "/tmp/" + fileId + ".xlsx";
       
       try (FileOutputStream fos = new FileOutputStream(filePath)) {
           excelBuilder.create()
                     .document(docClass)
                     .sheetData(/* ... */)
                     .write(fos);
       }
       
       return CompletableFuture.completedFuture("/download/file/" + fileId);
   }
   ```

2. **LRU 캐시**: 자주 사용되는 스타일, 포맷 등을 캐싱
   ```java
   @Bean
   public CacheManager cacheManager() {
       return new ConcurrentMapCacheManager("excelStyles", "excelFormats");
   }
   ```

3. **분할 처리**: 데이터를 청크로 나누어 처리
   ```java
   public void writeDataInChunks(Sheet sheet, SheetMeta meta, List<?> allData) {
       int rowIdx = meta.getDataStartCell().getRow();
       int chunkSize = 1000;
       
       for (int i = 0; i < allData.size(); i += chunkSize) {
           int end = Math.min(i + chunkSize, allData.size());
           List<?> chunk = allData.subList(i, end);
           
           // 청크 처리
           for (Object dto : chunk) {
               writeDataRow(sheet.createRow(rowIdx++), dto, meta);
           }
       }
   }
   ```

4. **메모리 모니터링**: JVM 메모리 사용량 모니터링을 통한 적절한 청크 크기 조정
   ```java
   private int determineOptimalChunkSize() {
       Runtime runtime = Runtime.getRuntime();
       long maxMemory = runtime.maxMemory();
       long usedMemory = runtime.totalMemory() - runtime.freeMemory();
       long availableMemory = maxMemory - usedMemory;
       
       // 사용 가능한 메모리에 따라 청크 크기 조정
       if (availableMemory < 100_000_000) { // 100MB 미만
           return 500;
       } else if (availableMemory < 500_000_000) { // 500MB 미만
           return 1000;
       } else {
           return 2000;
       }
   }
   ```

5. **병렬 처리**: 여러 시트를 병렬로 처리하는 방식 (주의: 스레드 안전성 고려 필요)
   ```java
   private void processAllSheetsInParallel(Workbook wb, ExcelMeta meta, Map<String, List<?>> dataMap) {
       ExecutorService executor = Executors.newFixedThreadPool(
           Math.min(meta.getSheets().size(), Runtime.getRuntime().availableProcessors())
       );
       
       List<Future<?>> futures = new ArrayList<>();
       
       // 각 시트를 별도 스레드에서 처리
       for (SheetMeta sheetMeta : meta.getSheets()) {
           futures.add(executor.submit(() -> {
               Sheet sheet = wb.createSheet(sheetMeta.getName());
               List<?> data = dataMap.get(sheetMeta.getName());
               // 시트 처리 로직...
               return null;
           }));
       }
       
       // 모든 작업 완료 대기
       for (Future<?> future : futures) {
           try {
               future.get();
           } catch (Exception e) {
               throw new ExcelException("Error processing sheet", e);
           }
       }
       
       executor.shutdown();
   }
   ```

## 마침

여기까지 따라오느라 고생 많으셨습니다.
지금까지 만든 엑셀 다운로드 모듈은 딱 두 가지로 요약할 수 있습니다.
1. 반복 코드를 싹 덜어낸 깔끔한 구조
- 어노테이션과 빌더 패턴으로 설정을 한눈에 파악할 수 있어요.
- 컨트롤러에서는 ExcelBuilder.create()…write() 한 줄이면 끝!
2. 대용량·다국어·검증·스타일링까지 한 번에
- SXSSF 스트리밍으로 수백만 건도 부담 없이 처리
- 메시지 리소스를 이용해 자동으로 다국어 헤더 적용
- Validator·Formatter 플러그인으로 필수 검증·포맷 커스터마이징

이제 매번 똑같은 몇백, 몇천줄의 엑셀의 셀 스타일을 짜느라 고생할 필요 없습니다.
엑셀 다운로드가 귀찮지 않고, 즐거워(?)질 수도 있어요.